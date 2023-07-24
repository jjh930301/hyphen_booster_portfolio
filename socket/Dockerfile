FROM node:14-alpine

WORKDIR /usr/src/socket

COPY *.* ./

RUN yarn install --frozen-lockfile --network-timeout 600000

RUN yarn build

COPY . .

CMD if [ "$ENV" = "development" ]; \
      then yarn run start:dev; \
    elif [ "$ENV" = "dev" ]; \
      then yarn run start:dev; \
    else \
      yarn run start; fi 