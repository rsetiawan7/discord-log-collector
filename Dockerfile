FROM node:12-alpine

RUN mkdir app

WORKDIR /app
ENTRYPOINT ["/bin/sh"]
