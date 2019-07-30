ARG PROD_NODE_IMAGE

FROM $PROD_NODE_IMAGE

COPY package.json package-lock.json .npmrc /payever/
RUN cd /payever && npm ci --only=prod

COPY . /payever

RUN ls /payever
RUN cd /payever && npm run build
RUN ls /payever/dist

ARG CI_COMMIT_SHA

RUN chmod 755 -R /payever/deploy
RUN echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/version
