from pathlib import Path
from datetime import datetime
import base64
import io
import numpy as np
from PIL import Image, ImageChops

class DataProcessor:
    """
    Processing images encoded in Base64 for use in ML pipelines.

    The processing includes:
        - Decoding Base64 strings into images
        - Cropping to the content bounding box
        - Resizing to fit within a 20x20 box while maintaining aspect ratio
        - Centering the image on a 28x28 grayscale canvas
        - Normalizing pixel values to [0, 1] and flattening to a 1D array
        - Saving processed images for debugging

    Attributes:
        save_dir (Path): Directory to save processed images.
        verbose (bool): If True, prints debug messages.
    """

    def __init__(self, save_dir="src/AI/logs/processed_images", verbose=True):
        """
        Initialize the DataProcessor.

        Args:
            save_dir (str): Directory where processed images will be saved.
            verbose (bool): Whether to print debug messages.
        """
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.verbose = verbose

    def _log(self, msg):
        """Print log message if verbose is enabled."""
        if self.verbose:
            print(f"[DataProcessor] {msg}")

    def pre_process(self, base64_string: str) -> np.ndarray:
        """
        Decode and preprocess a Base64-encoded image for ML input.

        Steps:
            1. Remove the optional Base64 header.
            2. Decode Base64 string into a PIL Image.
            4. Crop to content bounding box.
            5. Resize to fit within a 20x20 box while maintaining aspect ratio.
            6. Paste onto a centered 28x28 grayscale canvas.
            7. Save the processed image for debugging.
            8. Normalize pixel values to [0, 1] and flatten to a 1D array.

        Args:
            base64_string (str): Base64-encoded image string from frontend canvas.

        Returns:
            np.ndarray: Flattened 1D array of normalized pixel values (shape: 784, dtype: float32).

        Raises:
            ValueError: If the decoded image contains no visible content.
        """
        # Remove header if present (e.g., "data:image/png;base64,")
        if "," in base64_string:
            header, data = base64_string.split(",", 1)
            self._log(f"Header removed: {header}")
        else:
            data = base64_string

        # Convert Base64 string to bytes
        image_bytes = base64.b64decode(data)
        self._log("Converted Base64 string to bytes")

        # Create a PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        self._log(f"Image created: size={image.size}, mode={image.mode}")

         # Crop to content
        bbox = image.getbbox()
        if bbox:
          image = image.crop(bbox)
          self._log(f"Image cropped to bbox: {bbox}")
        else:
            self._log("No content found to crop - image is empty, raising exception")
            raise ValueError("Decoded image contains no visible content")

        w, h = image.size
        self._log(f"Image size after cropping: width={w}, height={h}")
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

        # Save for debugging
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        canvas.save(self.save_dir / f"processed_{timestamp}.png")
        self._log(f"Processed image saved to {self.save_dir / f'processed_{timestamp}.png'}")

        # Normalize to [0, 1] and flatten
        canvas_array = np.array(canvas, dtype=np.float32) / 255.0
        self._log("Image normalized and flattened")

        return canvas_array.flatten()
