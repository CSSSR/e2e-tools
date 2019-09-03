FROM node:10

ENV NODE_ENV development
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY modules/*/package.json ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

ENTRYPOINT sh ./scripts/ci.sh
