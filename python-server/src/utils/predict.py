import numpy as np
import tensorflow as tf
from .logger import log
from src.config import VERBOSE

class Predictor:
    """
    A class for making predictions using trained ML models.

    Supports:
        - Scikit-learn models with `predict_proba`
        - Keras/TensorFlow models with `predict`
    """

    def __init__(self, verbose: bool = None):
        """
        Initialize the Predictor.

        Args:
            verbose (bool, optional): Whether to print debug messages. Defaults to VERBOSE from config.
        """
        self.verbose = verbose if verbose is not None else VERBOSE

    def predict(self, model, input_data: np.ndarray) -> np.ndarray:
        """
        Make a prediction using the provided model and input data.

        Args:
            model: Trained ML model with a `predict` method.
            input_data (np.ndarray): Preprocessed input data (shape: (784,)).

        Returns:
            np.ndarray: Predicted class probabilities.
        """
        # TODO: Check if model is trained
        # Reshape input data to match required model input shape
        # input_data shape: (784,) — 1 row with 784 elements (no sample dimension)
        # Reshape to (1, 784): 1 row with 784 columns representing one sample  
        data = input_data.reshape(1, -1)

        # Make prediction for the single sample
        if isinstance(model, tf.keras.Model):
            probabilities = model.predict(data)[0]
        else:
            probabilities = model.predict_proba(data)[0]

        log(f"Probabilities: {probabilities}", caller="Predictor", verbose=self.verbose)

        return probabilities
