import os
import random
import logging
import joblib
import keras
import numpy as np
from pathlib import Path as _Path

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # 0=ALL,1=INFO,2=WARNING,3=ERROR
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
logging.getLogger("absl").setLevel(logging.ERROR)
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("werkzeug").setLevel(logging.ERROR)


# Flask is a lightweight web framework for Python. Is used to create a simple server
# that can handle HTTP requests from the React frontend.
# request is used to handle incoming HTTP requests
# jsonify is used to send JSON responses back to the client
# CORS is used to enable Cross-Origin Resource Sharing so that our React app
# can communicate with this server even if hosted on different domains/ports.
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from src.utils.db_utils import get_gallery, get_products
from src.AI.data_processor import DataProcessor
from src.AI.predict import Predictor

# --------------------------------------------------
# Load environment variables
# --------------------------------------------------
load_dotenv()
IG_USER_ID = os.environ.get("IG_USER_ID")
TOKEN = os.environ.get("IG_ACCESS_TOKEN")
ADMIN_USER = os.environ.get("REACT_APP_ADMIN_USER")
ADMIN_PASS = os.environ.get("REACT_APP_ADMIN_PASS")

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FOLDER = os.path.join(BASE_DIR, "data", "db")
os.makedirs(DB_FOLDER, exist_ok=True)
DB_PATH = os.path.join(DB_FOLDER, "shop.db")

# --------------------------------------------------
# Flask app
# --------------------------------------------------
app = Flask(__name__)

# --------------------------------------------------
# Load ML models
# --------------------------------------------------

# Global variabler för modeller
MODELS = {}

def load_models():
    """Ladda alla tränade modeller vid startup från src/AI/models"""
    global MODELS
    models_dir = _Path(__file__).resolve().parent / "src" / "AI" / "models"
    MODELS = {}
    loaded = []

    if not models_dir.exists():
        print(f"[APP] Models folder not found: {models_dir}")
        return

    # scikit-learn models
    for name, fname in [("logistic_regression", "LogisticRegression_model.joblib"),
                        ("random_forest", "RandomForest_model.joblib"),
                        ("neural_network", "NeuralNetwork_model.h5")]:
        path = models_dir / fname
        if path.exists():
            try:
                if name != "neural_network":
                    MODELS[name] = joblib.load(path)
                else:
                    MODELS[name] = keras.models.load_model(path)
                loaded.append(name)
            except Exception as e:
                print(f"[APP] Failed to load {fname}: {e}")
                MODELS[name] = None
        else:
            MODELS[name] = None

    # TensorFlow / Keras model
    # nn_path = models_dir / "NeuralNetwork_model.h5"
    # if nn_path.exists():
    #     try:
    #         from tensorflow import keras
    #         MODELS["neural_network"] = keras.models.load_model(nn_path)
    #         loaded.append("neural_network")
    #     except ImportError:
    #         print("[APP] TensorFlow not installed — skipping neural_network")
    #         MODELS["neural_network"] = None
    #     except Exception as e:
    #         print(f"[APP] Failed to load NeuralNetwork_model.h5: {e}")
    #         MODELS["neural_network"] = None
    # else:
    #     MODELS["neural_network"] = None

    print("[APP] Models loaded:", loaded)

# Call once at startup
load_models()

# --------------------------------------------------
# Routes
# --------------------------------------------------
# Basic GET route to check if the servers status
@app.route("/")
def health():
    return "Server Status: Running"

@app.route("/api/predict", methods=["POST"])
def predict():
    # Get the JSON data from the request
    data = request.get_json(silent=True) or {}
    # Get the base64 encoded image string
    image = data.get("image", "")

    model_name = data.get("model", "logistic_regression")
    print(f"[APP] Predict request received: model={model_name}")
    model_obj = MODELS.get(model_name)

    if data is None:
        return jsonify({"error": "Invalid or missing JSON"}), 400
    if not image:
        return jsonify({"error": "No image provided"}), 400
    if model_name not in MODELS:
        return jsonify({"error": f"Model '{model_name}' not available", "models_loaded": list(MODELS.keys())}), 400
    model = MODELS.get(model_name)
    if model is None:
        return jsonify({"error": f"Model '{model_name}' failed to load or is unavailable"}), 500

    # Process the image
    pre_processed_img = DataProcessor().pre_process(image)
    prediction_probabilities = Predictor().predict(model_obj, pre_processed_img)

    return jsonify({
        "predicted_digit": int(np.argmax(prediction_probabilities)),
        "confidence": float(np.max(prediction_probabilities)),
        "probabilities": [{"digit": i, "prob": float(prediction_probabilities[i])} for i in range(10)],
        "model_used": model_name})

@app.route("/api/gallery")
def api_gallery():
    return jsonify(get_gallery())

@app.route("/api/products")
def api_products():
    q = request.args.get("q", "").strip().lower()
    products = get_products()

    if not q:
        return jsonify(products)

    filtered = []

    for p in products:
        text_match = (
            q in p["name"].lower()
            or q in p["brand"].lower()
            or q in p["description"].lower()
        )

        number_match = False
        if q.isdigit():
            number = int(q)
            number_match = (
                p.get("id") == number
                or p.get("price") == number
            )

        if text_match or number_match:
            filtered.append(p)
            print(f"[APP] Matched product: {p['name']} (id={p['id']})")

    print(f"[APP] Total matches: {len(filtered)}")
    return jsonify(filtered)

@app.route("/api/products/<int:product_id>")
def api_product(product_id: int):
    """Return a single product by id or 404 if not found."""
    products = get_products()
    for p in products:
        if p.get("id") == product_id:
            return jsonify(p)
    return jsonify({"error": "Product not found"}), 404

from flask import abort

ADMIN_USER = os.environ.get("REACT_APP_ADMIN_USER")
ADMIN_PASS = os.environ.get("REACT_APP_ADMIN_PASS")

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True)
    username = data.get("username", "")
    password = data.get("password", "")

    if username == ADMIN_USER and password == ADMIN_PASS:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Fel användarnamn eller lösenord"}), 401

@app.route("/api/products", methods=["POST"])
def api_add_product():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    products = get_products()  # Hämta nuvarande produkter
    new_id = max([p["id"] for p in products], default=0) + 1
    new_product = {
        "id": new_id,
        "name": data.get("name", "TBD"),
        "brand": data.get("brand", "Craft Etc"),
        "price": data.get("price", 200),
        "description": data.get("description", ""),
        "image_url": data.get("image_url", ""),
    }

    # Spara till DB (eller memory om du inte implementerat insert yet)
    # Här behöver du skriva en funktion i db_utils.py som lägger till produkt
    from src.utils.db_utils import add_product
    add_product(new_product)

    return jsonify(new_product), 201

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def api_delete_product(product_id: int):
    from src.utils.db_utils import delete_product
    success = delete_product(product_id)
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Product not found"}), 404

@app.route("/api/products/random")
def random_products():
    try:
        products = get_products()
        selected = random.sample(products, k=min(6, len(products)))
        return jsonify(selected)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# MAIN
# --------------------------------------------------
if __name__ == "__main__":
    # Start the Flask development server on port 5000
    # debug=True reloads the server automatically when files change
    app.run(host="0.0.0.0", port=5000, debug=True)
