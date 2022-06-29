FROM node:alpine

WORKDIR /frontend

COPY ./frontend /frontend

ENV PATH /frontend/node_modules/.bin:$PATH

RUN npm install

CMD ["npm", "start"]