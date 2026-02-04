import numpy as np
import tensorflow as tf
from pathlib import Path
from .logger import log
from src.config import VERBOSE

class Predictor:
    """
    A class for making predictions using trained ML models.

    Supports:
        - Scikit-learn models with `predict_proba`
        - Keras/TensorFlow models with `predict`
    """

    def __init__(self, label: int, verbose: bool = None, log_dir: str = "./logs"):
        """
        Initialize the Predictor.

        Args:
            verbose (bool, optional): Whether to print debug messages. Defaults to VERBOSE from config.
            log_dir (str): Directory where log files will be saved.
        """
        self.verbose = verbose if verbose is not None else VERBOSE
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.label = label

    def predict(self, model, input_data: np.ndarray) -> np.ndarray:
        """
        Make a prediction using the provided model and input data.

        Args:
            model: Trained ML model with a `predict` method.
            input_data (np.ndarray): Preprocessed input data (shape: (784,)).

        Returns:
            np.ndarray: Predicted class probabilities.
        """
        # Reshape input data to match required model input shape
        data = input_data.reshape(1, -1)

        # Gör prediktionen
        if isinstance(model, tf.keras.Model):
            probabilities = model.predict(data)[0]
            model_name = "neural_network"
        else:
            probabilities = model.predict_proba(data)[0]
            # Bestäm loggningsfil baserat på modelltyp
            model_class_name = type(model).__name__.lower()
            if "logistic" in model_class_name:
                model_name = "logistic_regression"
            elif "forest" in model_class_name:
                model_name = "random_forest"
            else:
                model_name = "other_model"

        # Logga probabilities till konsol
        log(f"Probabilities: {probabilities}", caller="Predictor", verbose=self.verbose)

        # Logga resultat till fil
        self._log_result(model_name, probabilities)

        return probabilities

    def _log_result(self, model_name: str, probabilities: np.ndarray):
        """
        Log the predicted class and probability to the appropriate file.

        Args:
            model_name (str): Name of the model (used for filename).
            probabilities (np.ndarray): Predicted class probabilities.
        """
        log_file = self.log_dir / f"{model_name}_result.log"
        label = self.label
        predicted_class = int(np.argmax(probabilities))
        predicted_prob = float(np.max(probabilities))

        with log_file.open("a") as f:
            if label is not None:
                f.write(f"{label}, {predicted_class}, {predicted_prob}\n")

        log(f"Logged to {log_file}: {label}, {predicted_class}, {predicted_prob}",
            caller="Predictor", verbose=self.verbose)
