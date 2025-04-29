FROM python:3.12

WORKDIR /app

COPY ./requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

RUN python3 -m nltk.downloader -d /root/nltk_data wordnet punkt omw-1.4 stopwords punkt_tab

ENV NLTK_DATA=/root/nltk_data

COPY . /app/

CMD ["python", "-u","./main.py"]

