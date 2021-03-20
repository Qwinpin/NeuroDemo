import json
import io
from PIL import Image
import numpy as np


def load(data):
    image = Image.open(io.BytesIO(data))
    return image
