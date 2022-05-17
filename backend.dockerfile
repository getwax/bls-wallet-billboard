FROM node:16-alpine

ADD node_modules /app/node_modules
ADD package.json /app
ADD yarn.lock /app
ADD backend /app/backend
WORKDIR /app

CMD [ \
  "yarn", \
  "ts-node", \
  "backend/index.ts" \
]
