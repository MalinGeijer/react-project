import numpy as np
from flask import jsonify
from .data_processor import DataProcessor
from .predict import Predictor
from src.config import VERBOSE

def predict_number_from_request(data: dict, MODELS: dict):
    """
    Process a JSON request containing a base64-encoded image and predict the digit.

    Expected payload:
        - image: base64-encoded image string
        - model: optional model key (defaults to "logistic_regression")

    Returns:
        - JSON response with:
            - predicted_digit (int)
            - confidence (float)
            - probabilities (list of dicts with 'digit' and 'prob')
            - model_used (str)
        - HTTP status code (200 if successful, 400 if no image)
    """
    image = data.get("image")

    if not image:
        return jsonify({"error": "No image provided."}), 400 
    model_name = data.get("model", "logistic_regression")

    # Process the image
    dp = DataProcessor(verbose=VERBOSE)
    image_pil = dp.decode_base64_image(image)
    image_resized = dp.resize_and_center_image(image_pil)
    image_normalized = dp.normalize_and_flatten_image(image_resized)

    # Predict
    model_obj = MODELS[model_name]
    prediction_probabilities = Predictor(verbose=VERBOSE).predict(
        model_obj,
        image_normalized
    )

    # Normalize probabilities to sum to 1
    prediction_probabilities = prediction_probabilities / np.sum(prediction_probabilities)

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
    return jsonify(response), 200
