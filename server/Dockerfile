FROM node:9.11-alpine

WORKDIR /usr/app
COPY package.json package-lock.json /usr/app/

RUN npm install

COPY . /usr/app

RUN npm run build

CMD [ "npm", "run", "dev" ]
