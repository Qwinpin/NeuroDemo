import json
import io
from PIL import Image
import cv2
import numpy as np


def load(data):
    image = Image.open(io.BytesIO(data))
    opencvImage = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    return opencvImage
