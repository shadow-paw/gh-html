FROM node:9.10.0-alpine

WORKDIR /usr/src/app
COPY package*.json /usr/src/app/

RUN npm install

COPY . /usr/src/app

RUN npm run build

CMD [ "npm", "run", "dev" ]
