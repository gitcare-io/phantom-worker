FROM node:11.10

ADD package.json /app/
WORKDIR /app

RUN npm install

ADD . /app

# EXPOSE $PORT
