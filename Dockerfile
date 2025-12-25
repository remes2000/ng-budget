FROM node:24-alpine3.22

ARG PB_VERSION=0.35.0
ARG PNPM_VERSION=10.26.2

# Step 1 install the dependencies

RUN apk add --no-cache \
    unzip \
    ca-certificates

RUN npm install -g pnpm@${PNPM_VERSION}

# Step 2 setup PocketBase

ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# uncomment to copy the local pb_migrations dir into the image
# COPY ./pb_migrations /pb/pb_migrations

# uncomment to copy the local pb_hooks dir into the image
# COPY ./pb_hooks /pb/pb_hooks

# Step 3 build Angular application
COPY . /frontend

WORKDIR /frontend

RUN pnpm i
RUN pnpm build --configuration production

# Step 4 publish angular application in pb_public
RUN mkdir /pb/pb_public
RUN cp -r /frontend/dist/ng-budget/browser/. /pb/pb_public/
RUN cp /frontend/dist/ng-budget/3rdpartylicenses.txt /pb/public

EXPOSE 8080

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
