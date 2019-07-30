ARG PROD_NODE_IMAGE

FROM $PROD_NODE_IMAGE

ARG CI_COMMIT_SHA
COPY package.json package-lock.json .npmrc /payever/
COPY . /payever
RUN cd /payever && npm ci --only=prod


RUN ls /payever
RUN cd /payever && npm run build
RUN ls /payever/dist

ARG CI_COMMIT_SHA

RUN chmod 755 -R /payever/deploy
RUN echo $CI_COMMIT_SHA && echo $CI_COMMIT_SHA > /payever/version
