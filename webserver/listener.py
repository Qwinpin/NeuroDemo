from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from starlette.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import requests
import io

app = FastAPI()

origins = [
    "*",
    "http://localhost:9000",
    "http://localhost:9000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")
templates_methods = Jinja2Templates(directory="templates/methods")


@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/method={id}", response_class=HTMLResponse)
async def load_page_test(request: Request, id: str):
    return templates_methods.TemplateResponse("method_page_{}.html".format(id), {"request": request, "id": id})

@app.post("/file={id}")
async def image(image: UploadFile = File(...), id: int = 0):
    # with open('to_process/files/{}'.format(id), 'wb') as f:
    #     f.write(await image.read())
    try:
        r = requests.post('http://localhost:9050/file/{}'.format(id), files={'image': await image.read()})
        res = r.content
    except:
        r = {}

    # print(res)
    return StreamingResponse(io.BytesIO(res), media_type="image/png",
        headers={'Access-Control-Allow-Origin': '*'})

# @app.post("/audio")
# async def image(image: UploadFile = File(...)):

#     with open('to_process/images/{}.{}'.format(id, image.filename.split('.')[-1]), 'wb') as f:
#         f.write(await image.read())

#     return {"filename": image}

@app.get("/image={id}")
async def image_web(id: str, type: str = 'png'):
    return FileResponse('static/images/{}.{}'.format(id, type))

@app.get("/images/icons/link.svg")
async def tmplinksvg():
    return FileResponse('static/images/icons/link.svg')

@app.get("/method_request={method_id}?object_id={id}")
async def make_request(id: str, method_id: str):
    pass
