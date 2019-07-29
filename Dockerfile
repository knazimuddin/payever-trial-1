ARG BUILD_NODE_IMAGE
ARG PROD_NODE_IMAGE

FROM $BUILD_NODE_IMAGE AS build

COPY package.json package-lock.json .npmrc /payever/
RUN cd /payever && npm ci

COPY . /payever
RUN cd /payever && npm run build


FROM $PROD_NODE_IMAGE

ARG CI_COMMIT_SHA

COPY --from=build /payever /payever

RUN chmod 755 -R /payever/deploy
RUN echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/version
