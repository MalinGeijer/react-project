import numpy as np
from flask import jsonify
from src.AI.data_processor import DataProcessor
from src.AI.predict import Predictor

def predict_number_from_request(data, MODELS):
    """
    Process a JSON request containing a base64 image and model name,
    and return the prediction result as a dictionary.
    """
    if data is None:
        return jsonify({"error": "Invalid or missing JSON"}), 400

    # Get the base64 encoded image string
    image = data.get("image", "")
    model_name = data.get("model", "logistic_regression")

    if not image:
        return jsonify({"error": "No image provided"}), 400
    if model_name not in MODELS:
        return jsonify({
            "error": f"Model '{model_name}' not available",
            "models_loaded": list(MODELS.keys())
        }), 400

    model_obj = MODELS.get(model_name)
    if model_obj is None:
        return jsonify({
            "error": f"Model '{model_name}' failed to load or is unavailable"
        }), 500

    # Process the image
    dp = DataProcessor()
    image_pil = dp.decode_base64_image(image)
    image_resized = dp.resize_and_center_image(image_pil)
    image_normalized = dp.normalize_and_flatten_image(image_resized)

    # Predict
    prediction_probabilities = Predictor().predict(model_obj, image_normalized)

    # Normalize probabilities to sum to 1
    # prediction_probabilities = prediction_probabilities / np.sum(prediction_probabilities)
    # print(Sannolikheterna summerar till 1 och representerar en normaliserad sannolikhetsfördelning.)

    # Build response
    response = {
        "predicted_digit": int(np.argmax(prediction_probabilities)),
        "confidence": float(np.max(prediction_probabilities)),
        "probabilities": [
            {"digit": i, "prob": float(prediction_probabilities[i])}
            for i in range(10)
        ],
        "model_used": model_name
    }
    return jsonify(response)

