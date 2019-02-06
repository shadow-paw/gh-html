FROM node:11.9.0-alpine

RUN npm install -g npm

WORKDIR /usr/app
COPY package.json package-lock.json /usr/app/
RUN npm install

COPY . /usr/app
RUN npm run build

CMD [ "npm", "run", "prod" ]
