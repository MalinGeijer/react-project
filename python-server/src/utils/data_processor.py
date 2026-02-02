# python-server/src/utils/data_processor.py
import base64
import io
import numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage
from .logger import log
from src.config import VERBOSE

class DataProcessor:
    """
    Process images encoded in Base64 for ML pipelines.

    The processing includes:
        - Decoding Base64 strings into images
        - Cropping to content bounding box
        - Resizing to fit within a 20x20 box while maintaining aspect ratio
        - Centering the image on a 28x28 grayscale canvas
        - Centering based on the center of mass (MNIST-style)
        - Normalizing pixel values to [0, 1] and flattening to 1D array
        - Saving processed images for debugging

    Attributes:
        save_dir (Path): Directory to save processed images.
        verbose (bool): If True, prints debug messages.
    """

    def __init__(self, save_dir="images", verbose=None):
        """
        Initialize the DataProcessor.

        Args:
            save_dir (str): Directory where processed images will be saved.
            verbose (bool): Whether to print debug messages.
        """
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.verbose = verbose if verbose is not None else VERBOSE

    def convert_np_array_to_image(self, array: np.ndarray) -> Image.Image:
        """
        Convert a 1D numpy array of length 784 back to a 28x28 PIL Image.

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
        log("Converted numpy array back to PIL Image", caller="DataProcessor", verbose=self.verbose)

        return image

    def decode_base64_image(self, base64_string: str):
        """
        Decode a Base64-encoded string into a PIL Image.
        Saves the decoded image for debugging.

        Args:
            base64_string (str): Base64-encoded image string.

        Returns:
            Image.Image: Decoded PIL Image.
        """
        # Remove header if present (e.g., "data:image/png;base64,")
        if "," in base64_string:
            header, data = base64_string.split(",", 1)
            log(f"Header removed: {header}", caller="DataProcessor", verbose=self.verbose)
        else:
            data = base64_string

        # Convert Base64 string to bytes
        image_bytes = base64.b64decode(data)
        log("Converted Base64 string to bytes", caller="DataProcessor", verbose=self.verbose)

        # Create a PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        log(f"Image created: size={image.size}, mode={image.mode}", caller="DataProcessor", verbose=self.verbose)
        # Save for debugging
        output_path = self.save_dir / "decoded_image.png"
        image.save(output_path)
        log(f"Decoded image saved to {output_path}", caller="DataProcessor", verbose=self.verbose)
        return image

    def resize_and_center_image(self, image: Image.Image) -> Image.Image:
        """
        Resize image to fit within 20x20 box while maintaining aspect ratio,
        then center it on a 28x28 grayscale canvas, and center using center of mass.

        Args:
            image (Image.Image): Input PIL Image.

        Returns:
            Image.Image: Processed PIL Image.
        """
        # Convert to grayscale
        image = image.convert("L")
        log("Converted image to grayscale", caller="DataProcessor", verbose=self.verbose)

        # Crop to content, check for empty bbox already done
        bbox = image.getbbox()
        if bbox:
          image = image.crop(bbox)
          log(f"Image cropped to bbox: {bbox}", caller="DataProcessor", verbose=self.verbose)

        w, h = image.size
        log(f"Image size after cropping: width={w}, height={h}", caller="DataProcessor", verbose=self.verbose)
        # Resize to fit within 20x20 box while maintaining aspect ratio
        scale = 20.0 / max(w, h)
        new_size = (int(w * scale), int(h * scale))
        # Content rescaled size
        log(f"Content rescaled to: {new_size}", caller="DataProcessor", verbose=self.verbose)
        # Resize image using NEAREST to avoid introducing new gray levels
        # Each new pixel gets the value of the nearest pixel from the original image
        image = image.resize(new_size, Image.NEAREST)

        # Create new grayscale 28x28 canvas, default color is black (0)
        canvas = Image.new("L", (28, 28), 0)
        # Find offset to center the image
        offset = ((28 - new_size[0]) // 2, (28 - new_size[1]) // 2)
        log(f"Offset for centering: {offset}", caller="DataProcessor", verbose=self.verbose)
        # Content centered to new canavas size
        log(f'Image resized to {canvas.size}', caller="DataProcessor", verbose=self.verbose)
        # Paste resized image onto the center of the canvas
        canvas.paste(image, offset)

        # center of mass centering (MNIST-style)
        canvas_np = np.array(canvas)
        cy, cx = ndimage.center_of_mass(canvas_np)
        log(f"Center of mass: ({cx}, {cy})", caller="DataProcessor", verbose=self.verbose)

        shift_x = int(round(14 - cx))
        shift_y = int(round(14 - cy))

        canvas_np = ndimage.shift(
            canvas_np,
            shift=(shift_y, shift_x),
            order=0,
            mode="constant",
            cval=0
        )

        canvas = Image.fromarray(canvas_np)

        # Save for debugging
        output_path = self.save_dir / "resized_centered_image.png"
        canvas.save(output_path)
        log(f"Resized and centered image saved to {output_path}", caller="DataProcessor", verbose=self.verbose)

        return canvas

    def normalize_and_flatten_image(self, image: Image.Image) -> np.ndarray:
        """
        Normalize pixel values to [0, 1] and flatten image to a 1D array.

        Args:
            image (Image.Image): Input PIL Image.

        Returns:
            np.ndarray: Flattened and normalized image array.
        """
        # Convert to numpy array
        image_array = np.array(image, dtype=np.float32)
        log("Converted image to numpy array", caller="DataProcessor", verbose=self.verbose)

        # Normalize to [0, 1]
        image_array /= 255.0
        log("Normalized pixel values to [0, 1]", caller="DataProcessor", verbose=self.verbose)
        # Flatten to 1D array
        flattened_array = image_array.flatten()
        log("Flattened image to 1D array", caller="DataProcessor", verbose=self.verbose)

        return flattened_array
