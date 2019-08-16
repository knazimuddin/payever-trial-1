ARG BUILD_NODE_IMAGE
ARG PROD_NODE_IMAGE

FROM $BUILD_NODE_IMAGE AS build

COPY package.json package-lock.json .npmrc /payever/
RUN cd /payever && npm ci --only=prod

FROM $PROD_NODE_IMAGE

COPY --from=build /payever /payever

COPY . /payever
RUN cd /payever && npm run build

ARG CI_COMMIT_SHA

RUN chmod 755 -R /payever/deploy
RUN echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/version
