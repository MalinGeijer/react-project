from pathlib import Path
import joblib
from tensorflow.keras.models import load_model as keras_load_model


def load_models(models: dict):
    """
    Load all ML models into the provided dict.
    The dict is mutated in-place and owned by app.py.
    """
    if models:
        return  # redan laddade

    print("Loading models...")

    models_dir = Path(__file__).parent.parent / "models"

    # ---- scikit-learn / classical ML models ----
    models["logistic_regression"] = joblib.load(
        models_dir / "LogisticRegression.joblib"
    )

    models["random_forest"] = joblib.load(
        models_dir / "RandomForest.joblib"
    )

    # ---- neural network (Keras / TensorFlow) ----
    models["neural_network"] = keras_load_model(
        models_dir / "NeuralNetwork.h5",
        compile=False  # viktigt vid inference-only
    )

    print("Models loaded:", list(models.keys()))
