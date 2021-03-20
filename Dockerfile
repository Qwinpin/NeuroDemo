FROM python:3.8

RUN apt update && apt -y upgrade

WORKDIR /neurodemo

EXPOSE 8811 8812 8813 8814 9055

COPY . .

RUN python -m pip install numpy==1.19.2 \
ipykernel \
pandas==1.2.3 \
matplotlib==3.3.4 \
plotly==4.14.3 \
pillow==8.0 \
fastapi \
uvicorn[standard] \
nltk \
jinja2 \
aiofiles \
python-multipart \
git+https://github.com/nlpub/pymystem3 && \
python -m nltk.downloader all

RUN python -m pip install torch==1.8.0+cpu \
torchvision==0.9.0+cpu \
torchaudio==0.8.0 -f https://download.pytorch.org/whl/torch_stable.html

RUN python -m pip install tensorflow==2.4.1

RUN apt -y install jupyter && \
python -m pip install ipykernel && \
python -m ipykernel install --user --name default

