FROM node:10

WORKDIR /usr/src/app
COPY . .

ENTRYPOINT sh ./scripts/ci.sh
