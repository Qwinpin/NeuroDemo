import numpy as np

import loader
import responser

def main(ids: int):
    data = loader.load(ids)
    result = np.zeros((data)).tolist()
    
    responser.save(ids, result)
    
    return 200

