FROM node:lts-alpine AS build
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
CMD [ "npm", "start" ]