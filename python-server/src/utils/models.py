import joblib

from tensorflow.keras.models import load_model as keras_load_model
from pathlib import Path
from .logger import log

def loader(models: dict, verbose: bool = True) -> None:
    if models:
        return  # redan laddade

    log("Loading models...", caller="Loader", verbose=verbose)
    # Hämta projektroten (en nivå upp från src)
    PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
    MODELS_DIR = PROJECT_ROOT / "models"

    # ---- scikit-learn / classical ML models ----
    models["logistic_regression"] = joblib.load(MODELS_DIR / "LogisticRegression.joblib")
    models["random_forest"] = joblib.load(MODELS_DIR / "RandomForest.joblib")

    # ---- neural network (Keras / TensorFlow) ----
    models["neural_network"] = keras_load_model(MODELS_DIR / "NeuralNetwork.h5", compile=False)

    log("Models loaded successfully", caller="Loader", verbose=verbose)
    log(f"Loaded models: {list(models.keys())}", caller="Loader", verbose=verbose)
