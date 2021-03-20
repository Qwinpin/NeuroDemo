import json
import io


def save(data):
    result = io.BytesIO()
    data.save(result, "JPEG") 
    result.seek(0)
    return result
