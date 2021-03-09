import json


def save(ids: int, data):
    with open('output_{}.json'.format(ids), 'w') as f:
        json.dump(data, f)

