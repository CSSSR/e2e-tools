FROM node:10

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY modules/*/package.json ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

ENTRYPOINT sh ./scripts/ci.sh
