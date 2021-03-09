How to start:
```
docker build -t neurodemo:0.1 .
docker run -it -d --name neurodemo -p 8814:8814 -p 9055:9055 -p 8813:8813 neurodemo:0.1

nohup jupyter notebook --port 8814 --no-browser --ip=0.0.0.0 --NotebookApp.token='' --NotebookApp.password='' --allow-root &
uvicorn listener:app --reload --port 9055 --host 0.0.0.0
​```
```