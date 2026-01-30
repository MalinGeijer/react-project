# src/__init__.py
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # 0=ALL,1=INFO,2=WARNING,3=ERROR
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # Disable GPUs for TensorFlow

from .utils import DataProcessor, ModelTrainer, Predictor
from .utils import (
    get_gallery,
    get_products,
    add_product,
    delete_product,
    predict_number_from_request,
    loader,
    log
)

