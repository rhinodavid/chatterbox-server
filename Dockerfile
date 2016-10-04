FROM node:argon

RUN mkdir -p /src/usr/app
WORKDIR /src/usr/app

COPY package.json /src/usr/app/
COPY bower.json /src/usr/app/
COPY .bowerrc /src/usr/app/

RUN npm install

COPY . /src/usr/app

EXPOSE 3000

CMD ["npm", "start"]

