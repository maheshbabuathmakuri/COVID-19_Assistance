FROM rasa/rasa:latest-full 

WORKDIR /app
COPY . /app
COPY ./data /app/data

USER root

RUN pip3 install recognizers-text-suite

USER 1001

RUN  rasa train

VOLUME /app
VOLUME /app/data
VOLUME /app/models

CMD [ "run","-m","/app/models","--enable-api","--cors","*","--debug" ]