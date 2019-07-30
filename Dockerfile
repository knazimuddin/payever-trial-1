# syntax=docker/dockerfile:experimental
ARG PROD_NODE_IMAGE

FROM $PROD_NODE_IMAGE

COPY package.json package-lock.json .npmrc /payever/
RUN --mount=type=cache,target=/root/.npm cd /payever && npm ci --only=prod && npm cache clear --force

COPY . /payever
RUN cd /payever && npm run build

ARG CI_COMMIT_SHA

RUN chmod 755 -R /payever/deploy
RUN echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/version
