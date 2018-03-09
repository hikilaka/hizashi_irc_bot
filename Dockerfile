FROM node:8.10.0-alpine

RUN apk add --no-cache libc6-compat

USER node
WORKDIR /src
ADD . .

RUN npm install
CMD ["npm", "run", "start-headless"]
