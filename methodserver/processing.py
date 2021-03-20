import numpy as np
import loader
import responser


def processing(data):
    data = loader.load(data)
    # perform something
    return responser.save(data)
