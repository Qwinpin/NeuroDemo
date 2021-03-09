import json


def load(ids: int):
    with open('input_{}.json'.format(ids), 'r') as f:
        data = int(json.load(f))
    
    return data
