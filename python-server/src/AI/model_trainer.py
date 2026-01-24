import os
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from joblib import dump
import numpy as np

from tensorflow import keras
from keras.datasets import mnist
from keras.models import Sequential
from keras.layers import Dense, Flatten

class ModelTrainer:
    """
    Handles training and prediction using different models on the MNIST dataset.

    Supported models:
        - Logistic Regression ("LR")
        - Random Forest ("RF")
        - Multi-layer Perceptron Neural Network ("MLP")
    """

    MODEL_NAMES = {
        "LR": "LogisticRegression",
        "RF": "RandomForest",
        "MLP": "NeuralNetwork",
    }

    def __init__(self,
                 model_name="LR",
                 train_size=60000,
                 iterations=100,
                 trees=100,
                 epochs=20,
                 random_state=42):

        self.random_state = random_state
        self.train_size = train_size
        self.iterations = iterations
        self.trees = trees
        self.epochs = epochs
        self.is_trained = False

        self.full_name = self.MODEL_NAMES.get(model_name, "Unknown Model")

        if model_name == "LR":
            self.model = LogisticRegression(max_iter=iterations, random_state=random_state)
        elif model_name == "RF":
            self.model = RandomForestClassifier(n_estimators=trees, random_state=random_state)
        elif model_name == "MLP":
            # Keras Sequential MLP
            self.model = Sequential([
                Flatten(input_shape=(28,28)),
                Dense(128, activation='relu'),
                Dense(10, activation='softmax')  # 10 klasser för MNIST
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
        Loads MNIST dataset, normalizes it, trains the model, and saves it.
        """
        # Load MNIST
        (x_train, y_train), (_, _) = mnist.load_data()
        x_train = x_train[:self.train_size]
        y_train = y_train[:self.train_size]

        # Normalize images
        x_train = x_train.astype("float32") / 255.0

        print(f"Training {self.full_name} on {x_train.shape[0]} samples...")

        # Train
        if self.full_name in ["LogisticRegression", "RandomForest"]:
            X_train = x_train.reshape(x_train.shape[0], -1)
            self.model.fit(X_train, y_train)
            os.makedirs("models", exist_ok=True)
            file_path = os.path.join("models", f"{self.full_name}_model.joblib")
            dump(self.model, file_path)
        else:  # NeuralNetwork (Keras)
            self.model.fit(x_train, y_train, epochs=self.epochs, batch_size=32, verbose=1)
            os.makedirs("models", exist_ok=True)
            file_path = os.path.join("models", f"{self.full_name}_model.h5")
            self.model.save(file_path)

        self.is_trained = True
        print(f"Model saved to {file_path}")
        return file_path
