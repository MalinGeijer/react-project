import base64
import io
import numpy as np
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageOps

def image_decode(base64_string: str, verbose: bool = True) -> Image.Image:
    """
    Takes a base64-encoded image string,
    converts it to a grayscale image,
    and saves it as a PNG file.
    Returns the PIL Image object.
    """

    # Helper function for logging
    def _log(msg: str):
        if verbose:
            print(f"[image_decode] {msg}")

    # Create output directory if it doesn't exist
    output_path = Path("test_images")
    output_path.mkdir(parents=True, exist_ok=True)

    _log("Starting decoding process")

    try:
        # Remove header if present (e.g., "data:image/png;base64,")
        if "," in base64_string:
            # Split the header from the base64 data
            header, base64_string = base64_string.split(",", 1)
            _log(f"Header removed: {header}")

        # Convert base64 string to bytes
        image_bytes = base64.b64decode(base64_string)
        _log("Converted base64 string to bytes")

        # Create an image from the bytes and convert to grayscale (L = luminance)
        image = Image.open(io.BytesIO(image_bytes)).convert("L")
        _log(f"Image created: size={image.size}, mode={image.mode}(grayscale)")

        # Invert colors for cropping to work correctly
        image = Image.open(io.BytesIO(image_bytes)).convert("L")  # gråskala
        image = ImageOps.invert(image)  # svart streck blir vitt

        # Crop to content
        bbox = image.getbbox()
        if bbox:
          image = image.crop(bbox)
          _log(f"Image cropped to bbox: {bbox}")
        else:
            _log("No content found to crop – image is empty, raising exception")
            raise ValueError("Decoded image contains no visible content")

        # Invert back to original colors
        image = ImageOps.invert(image)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = output_path / f"input_{timestamp}.png"
        image.save(filename)
        _log(f"Image saved to {filename}")
        _log("Decoding completed")

        return image

    except Exception as e:
        _log(f"Error while decoding image: {e}")
        raise



def process_image(image: Image.Image, save: bool = True, verbose: bool = True) -> np.ndarray:
    """
    Converts a grayscale image to 28x28, normalizes it, flattens it,
    and optionally saves it to disk.

    Returns:
        np.ndarray: Flattened and normalized image array (shape: 784,)
    """
    # Helper function for logging
    def _log(msg: str):
        if verbose:
            print(f"[process_image] {msg}")

    try:
        # Resize image to 28x28
        image_resized = image.resize((28, 28))
        _log(f"Image resized to {image_resized.size}")

        # Optionally save resized image
        if save:
            output_path = Path("processed_images")
            output_path.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = output_path / f"processed_{timestamp}.png"
            image_resized.save(filename)
            _log(f"Resized image saved to {filename}")

        # Convert to numpy array
        img_array = np.array(image_resized, dtype=np.float32)
        _log(f"Converted to numpy array with shape {img_array.shape}")

        # Normalize pixel values to [0,1]
        img_array /= 255.0
        _log("Normalized pixel values to [0,1]")

        # Flatten to 1D array
        img_flat = img_array.flatten()
        _log(f"Flattened image to shape {img_flat.shape}")

        # Calculate and log mean
        mean_val = img_flat.mean()

        _log(f"Normalized pixel values to [0,1], mean={mean_val:.4f}")

        return img_flat

    except Exception as e:
        _log(f"Error processing image: {e}")
        raise
