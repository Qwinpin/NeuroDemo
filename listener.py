from typing import Optional

from fastapi import FastAPI
import time
import processing

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/id={ids}")
def process(ids: int):
    """
    Take ids, call processing, return response from processing (code 200, e.g.)
    
    """
    try:
        response = processing.main(ids)
    except Exception as e:
        response = e
    return {'Wop': ids, 'id': response}

