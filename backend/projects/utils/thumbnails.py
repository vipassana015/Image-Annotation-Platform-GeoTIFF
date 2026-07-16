import os
import numpy as np
import rasterio
from PIL import Image


def generate_thumbnail(
    geotiff_path,
    output_path,
    max_size=1024
):
    """
    Generate an aspect-ratio-preserving PNG thumbnail from a GeoTIFF.

    Parameters:
    - geotiff_path: absolute path to .tif file
    - output_path: absolute path where thumbnail PNG will be saved
    - max_size: maximum width or height in pixels
    """

    # Open GeoTIFF
    with rasterio.open(geotiff_path) as dataset:
        data = dataset.read()

    # Handle band layout
    # Common cases:
    # 1 band  -> grayscale
    # 3 bands -> RGB
    # more    -> take first 3 bands
    if data.shape[0] == 1:
        image = data[0]
        image = np.stack([image] * 3, axis=-1)
    else:
        image = data[:3]
        image = np.transpose(image, (1, 2, 0))

    # Normalize to 0–255
    image = image.astype(np.float32)
    min_val = image.min()
    max_val = image.max()

    if max_val > min_val:
        image = (image - min_val) / (max_val - min_val)
    else:
        image = np.zeros_like(image)

    image = (image * 255).astype(np.uint8)

    # Convert to PIL Image
    pil_image = Image.fromarray(image)

    # Resize while preserving aspect ratio
    pil_image.thumbnail((max_size, max_size), Image.LANCZOS)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save thumbnail
    pil_image.save(output_path, format="PNG")
