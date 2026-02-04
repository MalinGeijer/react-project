import os
import sys
import logging
import numpy as np
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.callbacks import CSVLogger
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from joblib import dump

class ModelTrainer:
    """
    Train ML models (Logistic Regression, Random Forest, or MLP) on MNIST dataset.

    Attributes:
        model_name (str): 'LR', 'RF', or 'MLP'.
        train_size (int): Number of training samples.
        iterations (int): Number of iterations for LR.
        trees (int): Number of trees for RF.
        epochs (int): Number of epochs for MLP.
        random_state (int): Random seed.
        is_trained (bool): Flag indicating if training is complete.
        full_name (str): Full name of the model.
        model: Instantiated ML model.
        logger: Logger instance for training.
    """

    MODEL_NAMES = {
        "LR": "LogisticRegression",
        "RF": "RandomForest",
        "MLP": "NeuralNetwork",
    }

    LOG_FILENAMES = {
        "LogisticRegression": "logs/logistic_regression.log",
        "RandomForest": "logs/random_forest.log",
        "NeuralNetwork": "logs/neural_network.log"
    }

    def __init__(self,
                 model_name="LR",
                 train_size=60000,
                 iterations=100,
                 trees=100,
                 epochs=20,
                 random_state=42):

        """
        Initialize ModelTrainer with model parameters and logging setup.

        Args:
            model_name (str): 'LR', 'RF', or 'MLP'.
            train_size (int): Number of training samples.
            iterations (int): Number of iterations for LR.
            trees (int): Number of trees for RF.
            epochs (int): Number of epochs for MLP.
            random_state (int): Random seed for reproducibility.

        Raises:
            ValueError: If an unsupported model_name is provided.
        """

        self.random_state = random_state
        self.train_size = train_size
        self.iterations = iterations
        self.trees = trees
        self.epochs = epochs
        self.is_trained = False

        self.full_name = self.MODEL_NAMES.get(model_name, "Unknown Model")

        # Setup logging
        os.makedirs("logs", exist_ok=True)
        log_file = self.LOG_FILENAMES[self.full_name]
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(message)s",
            handlers=[
                logging.FileHandler(log_file, mode='w'),  # overwrite log file
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(self.full_name)
        self.logger.info(f"Initializing ModelTrainer for {self.full_name}")

        # Initialize model
        if model_name == "LR":
            self.model = LogisticRegression(
                solver='saga',
                max_iter=self.iterations,
                tol=1e-3, # stops earlier if converged
                random_state=self.random_state,
                n_jobs=-1,
                verbose=1
            )
        elif model_name == "RF":
            self.model = RandomForestClassifier(
                n_estimators=self.trees,
                random_state=self.random_state,
                n_jobs=-1,
                verbose=1
            )
        elif model_name == "MLP":
            self.model = Sequential([
                Dense(128, activation='relu', input_shape=(784,)),
                Dense(10, activation='softmax')
            ])
            self.model.compile(
                optimizer='adam',
                loss='sparse_categorical_crossentropy',
                metrics=['accuracy']
            )
        else:
            raise ValueError(f"Model '{self.full_name}' is not supported")

    def train_on_mnist(self):
        """
        Load MNIST, normalize, train the model, calculate training accuracy,
        and save it to disk.

        Returns:
            str: File path to the saved model.
        """
        self.logger.info("Loading MNIST dataset...")
        (x_train, y_train), (_, _) = mnist.load_data()
        y_train = y_train[:self.train_size]
        # Preprocess data: flatten and normalize
        x_train_processed = x_train[:self.train_size].reshape(self.train_size, -1) / 255.0
        self.logger.info(f"Starting training on {x_train_processed.shape[0]} samples...")

        os.makedirs("models", exist_ok=True)

        if self.full_name in ["LogisticRegression", "RandomForest"]:
            # Train sklearn model
            self.model.fit(x_train_processed, y_train)

            # Calculate training accuracy
            train_accuracy = self.model.score(x_train_processed, y_train)

            # Log training accuracy
            self.logger.info(f"Training accuracy: {train_accuracy:.4f}")

            file_path = os.path.join("models", f"{self.full_name}.joblib")
            dump(self.model, file_path)

        else:  # NeuralNetwork
            csv_logger = CSVLogger(self.LOG_FILENAMES[self.full_name])
            self.model.fit(
                x_train_processed,
                y_train,
                epochs=self.epochs,
                batch_size=32,
                verbose=1,
                callbacks=[csv_logger]
            )

            # Calculate training accuracy
            train_preds = np.argmax(self.model.predict(x_train_processed), axis=1)
            train_accuracy = (train_preds == y_train).mean()

            # Log training accuracy
            self.logger.info(f"Training accuracy: {train_accuracy:.4f}")

            file_path = os.path.join("models", f"{self.full_name}.h5")
            self.model.save(file_path)

        self.is_trained = True
        self.logger.info(f"Training finished. Model saved to {file_path}")
        return file_path
