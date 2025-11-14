# Copyright 2021 The KubeSphere Authors. All rights reserved.
# Use of this source code is governed by an Apache license
# that can be found in the LICENSE file.

#######################
# Build Stage
#######################
FROM node:18.20.8-alpine3.20 AS builder

ARG YARN_VERSION=1.22.4

WORKDIR /kubesphere
ADD . /kubesphere/

# Install build dependencies
RUN apk add --no-cache python3 make g++ bash openssl ca-certificates

# Install Yarn
RUN corepack enable && corepack prepare yarn@${YARN_VERSION} --activate

# Install dependencies and build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN yarn build

# Copy compiled files
RUN mkdir -p /out/server
RUN mv /kubesphere/dist/ /out/
RUN mv /kubesphere/server/locales \
       /kubesphere/server/public \
       /kubesphere/server/views \
       /kubesphere/server/sample \
       /kubesphere/server/config.yaml /out/server/
RUN mv /kubesphere/package.json /out/

#######################
# Final Image
#######################
FROM node:18.20.8-alpine3.20 AS base_os_context

RUN adduser -D -g kubesphere -u 1002 kubesphere && \
    mkdir -p /opt/kubesphere/console && \
    chown -R kubesphere:kubesphere /opt/kubesphere/console

WORKDIR /opt/kubesphere/console
COPY --from=builder /out/ /opt/kubesphere/console/

# Move server.js to correct path
RUN mv dist/server.js server/server.js

USER kubesphere

EXPOSE 8080

CMD ["npm", "run", "serve"]
