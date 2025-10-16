FROM node:18-alpine

RUN npm install -g pm2

WORKDIR /usr/src/app

COPY auth-service/package*.json ./auth-service/
COPY billing-service/package*.json ./billing-service/
COPY management-service/package*.json ./management-service/
COPY gateway/package*.json ./gateway/

RUN cd auth-service && npm install
RUN cd billing-service && npm install
RUN cd management-service && npm install
RUN cd gateway && npm install

COPY auth-service/ ./auth-service/
COPY billing-service/ ./billing-service/
COPY management-service/ ./management-service/
COPY gateway/ ./gateway/

RUN cd auth-service && npm run build
RUN cd billing-service && npm run build
RUN cd management-service && npm run build
RUN cd gateway && npm run build

EXPOSE 8080

CMD ["pm2-runtime", "start", "ecosystem.config.js"]