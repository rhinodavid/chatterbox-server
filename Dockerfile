FROM node:argon

RUN mkdir -p /src/usr/app
WORKDIR /src/usr/app

ENV DOCKER true

COPY package.json /src/usr/app/
COPY bower.json /src/usr/app/
COPY .bowerrc /src/usr/app/

RUN npm install --production

COPY . /src/usr/app

RUN npm run postinstall

EXPOSE 3000

CMD ["npm", "start"]

