from typing import Optional
from fastapi import FastAPI, Response
from starlette.responses import StreamingResponse
from fastapi.responses import FileResponse
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import time
import processing


app = FastAPI()

origins = [
    "*"
    "http://localhost",
    "http://localhost:9050",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/id={ids}")
def process(ids: int):
    """
    Take ids, call processing, return response from processing (code 200, e.g.)
    
    """
    response = processing.main(ids)
    return StreamingResponse(response, media_type="image/png")
    # return {'Result of prediction': "All ur base are mine", 'id': ids, 'responce': StreamingResponse(response)}


@app.post("/file/{id}")
async def image(image: UploadFile = File(...), id: int = 0, num: int = 0):
    data = await image.read()

    response = processing.processing(data, num)

    return {'r': response}
    
    # return StreamingResponse(response, media_type="image/png")
    # return {'r': 5}
