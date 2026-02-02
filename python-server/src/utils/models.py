import joblib
from tensorflow.keras.models import load_model as keras_load_model
from pathlib import Path
from .logger import log

def loader(models: dict, verbose: bool = True) -> None:
    """
    Load ML models into the provided dictionary if not already loaded.

    Supports:
        - Scikit-learn classical models: LogisticRegression, RandomForest
        - Keras/TensorFlow neural network: NeuralNetwork

    Args:
        models (dict): Dictionary to populate with loaded models.
        verbose (bool): If True, prints log messages.
    """
    if models:
        return

    log("Loading models...", caller="Loader", verbose=verbose)

    # Get project root (one level above src)
    PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  
    MODELS_DIR = PROJECT_ROOT / "models"

    # ---- scikit-learn / classical ML models ----
    models["logistic_regression"] = joblib.load(MODELS_DIR / "LogisticRegression.joblib")
    models["random_forest"] = joblib.load(MODELS_DIR / "RandomForest.joblib")

    # ---- neural network (Keras / TensorFlow) ----
    models["neural_network"] = keras_load_model(MODELS_DIR / "NeuralNetwork.h5", compile=False)

    log("Models loaded successfully", caller="Loader", verbose=verbose)
    log(f"Loaded models: {list(models.keys())}", caller="Loader", verbose=verbose)
