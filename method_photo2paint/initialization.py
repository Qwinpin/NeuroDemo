import os
import requests


os.system('git clone https://github.com/jiupinjia/stylized-neural-painting.git')


def download_file_from_google_drive(id, destination):
    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params = { 'id' : id }, stream = True)
    token = get_confirm_token(response)

    if token:
        params = { 'id' : id, 'confirm' : token }
        response = session.get(URL, params = params, stream = True)

    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value

    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768

    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

id = '1FoclmDOL6d1UT12-aCDwYMcXQKSK6IWA'
download_file_from_google_drive(id, 'ckpt.zip')

os.system('unzip ckpt.zip -d stylized-neural-painting')
os.system('python -m pip install -r stylized-neural-painting/Requirements.txt')
os.system('apt-get install ffmpeg libsm6 libxext6  -y')
