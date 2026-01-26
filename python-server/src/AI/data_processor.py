import base64
import io
import numpy as np
from pathlib import Path
from datetime import datetime
from PIL import Image

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

    def __init__(self, save_dir="src/AI/images", verbose=True):
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

    def convert_np_array_to_image(self, array: np.ndarray) -> Image.Image:
        """
        Converts a 1D numpy array back to a 28x28 PIL Image.

        Args:
            array (np.ndarray): 1D numpy array of length 784.

        Returns:
            Image.Image: Converted PIL Image.
        """
        if array.size != 784:
            raise ValueError("Input array must have exactly 784 elements.")

        # Reshape to 28x28
        image_array = array.reshape((28, 28)) * 255.0  # Scale back to [0, 255]
        image_array = image_array.astype(np.uint8)

        # Create PIL Image
        image = Image.fromarray(image_array, mode='L')
        self._log("Converted numpy array back to PIL Image")

        return image

    def decode_base64_image(self, base64_string: str):
        """
        Decodes a Base64-encoded string into a PIL Image.
        Saves the decoded image for debugging.
        Args:
            base64_string (str): Base64-encoded image string.
        Returns:
            Image: Decoded PIL Image.
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

        # Save for debugging
        output_path = self.save_dir / "decoded_image.png"
        image.save(output_path)
        self._log(f"Decoded image saved to {output_path}")

        return image

    def resize_and_center_image(self, image: Image.Image) -> Image.Image:
        """
        Resize the image to fit within a 20x20 box while maintaining aspect ratio,
        then center it on a 28x28 grayscale canvas.

        Args:
            image (Image.Image): Input PIL Image.

        Returns:
            Image.Image: Processed PIL Image.
        """
        # Crop to content
        bbox = image.getbbox()
        if bbox:
          image = image.crop(bbox)
          self._log(f"Image cropped to bbox: {bbox}")
        else:
            raise ValueError("Decoded image contains no visible content")

        w, h = image.size
        self._log(f"Image size after cropping: width={w}, height={h}")
        # Resize to fit within 20x20 box while maintaining aspect ratio
        scale = 20.0 / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        # Content rescaled size
        self._log(f"Content rescaled to: {new_size}")
        # Resize image using NEAREST to avoid introducing new gray levels
        # Each new pixel gets the value of the nearest pixel from the original image
        image = image.resize(new_size, Image.NEAREST)

        # Create new grayscale 28x28 canvas, default color is black (0)
        canvas = Image.new("L", (28, 28), 0)
        # Find offset to center the image
        offset = ((28 - new_size[0]) // 2, (28 - new_size[1]) // 2)
        # Content centered to new canavas size
        self._log(f'Image resized to {canvas.size}')
        # Paste resized image onto the center of the canvas
        canvas.paste(image, offset)

        # Save for debugging
        output_path = self.save_dir / "resized_centered_image.png"
        canvas.save(output_path)
        self._log(f"Resized and centered image saved to {output_path}")

        return canvas

    def normalize_and_flatten_image(self, image: Image.Image) -> np.ndarray:
        """
        Normalize pixel values to [0, 1] and flatten the image to a 1D array.

        Args:
            image (Image.Image): Input PIL Image.
        Returns:
            np.ndarray: Flattened and normalized image array.
        """
        # Convert to numpy array
        image_array = np.array(image, dtype=np.float32)
        self._log("Converted image to numpy array")

        # Normalize to [0, 1]
        image_array /= 255.0
        self._log("Normalized pixel values to [0, 1]")

        # Flatten to 1D array
        flattened_array = image_array.flatten()
        self._log("Flattened image to 1D array")

        return flattened_array
