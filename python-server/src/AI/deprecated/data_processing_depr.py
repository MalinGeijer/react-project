import base64
import io
import numpy as np
from pathlib import Path
from datetime import datetime
from PIL import Image

"""
Decodes a base64 image string and preprocesses it for MNIST-compatible input.

Steps and rationale:

1. Base64 decoding - converts the input string to raw image bytes.
2. Grayscale conversion ('L' mode) - ensures a single luminance channel.
3. Temporary inversion before crop - allows getbbox() to correctly detect the digit.
4. Cropping using the bounding box - isolates the digit from empty space.
5. Resizing using NEAREST interpolation - preserves sharp edges and avoids new gray levels.
6. Creating a 28x28 canvas and pasting the resized digit centered - matches MNIST size and positioning.
7. Inverting back after all operations - ensures the digit is light on a dark background, consistent with MNIST.
8. Saving the resulting image and logging steps - useful for debugging and verification.

Returns:
    PIL.Image.Image: Preprocessed image ready for further processing or model input.
"""
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

        # Crop to content
        bbox = image.getbbox()
        if bbox:
          image = image.crop(bbox)
          _log(f"Image cropped to bbox: {bbox}")
        else:
            _log("No content found to crop – image is empty, raising exception")
            raise ValueError("Decoded image contains no visible content")

        w, h = image.size
        _log(f"Image size after cropping: width={w}, height={h}")
        # Resize to fit within 20x20 box while maintaining aspect ratio
        scale = 20.0 / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        # Resize image using NEAREST to avoid introducing new gray levels
        # Each new pixel gets the value of the nearest pixel from the original image
        image = image.resize(new_size, Image.NEAREST)

        # Create new grayscale 28x28 canvas, default color is black (0)
        canvas = Image.new("L", (28, 28), 0)
        # Find offset to center the image
        offset = ((28 - new_size[0]) // 2, (28 - new_size[1]) // 2)
        # Paste resized image onto the center of the canvas
        canvas.paste(image, offset)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = output_path / f"input_{timestamp}.png"
        canvas.save(filename)
        _log(f"Image saved to {filename}")
        _log("Decoding completed")

        return canvas

    except Exception as e:
        _log(f"Error while decoding image: {e}")
        raise


def process_image(image: Image.Image, save: bool = True, verbose: bool = True) -> np.ndarray:
    """
   normalizes it, flattens it,
    and optionally saves it to disk.

    Returns:
        np.ndarray: Flattened and normalized image array (shape: 784,)
    """
    # Helper function for logging
    def _log(msg: str):
        if verbose:
            print(f"[process_image] {msg}")

    try:
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        _log(f"Converted to numpy array with shape {img_array.shape}")

        # Normalize pixel values to [0,1]
        img_array /= 255.0
        _log("Normalized pixel values to [0,1]")

        # Flatten to 1D array
        img_flat = img_array.flatten()
        _log(f"Flattened image to shape {img_flat.shape}")

        # Calculate and log mean
        mean_val = img_flat.mean()

        _log(f"Mean={mean_val:.4f}")

        return img_flat

    except Exception as e:
        _log(f"Error processing image: {e}")
        raise
