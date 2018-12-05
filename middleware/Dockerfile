FROM ubuntu:18.04

EXPOSE 3001

# install nvm and nodejs
ENV NVM_DIR=/usr/local/nvm    NODE_VERSION=10.1.0

RUN rm /bin/sh && ln -s /bin/bash /bin/sh &&\
        apt-get update &&\
        apt-get install -y curl git &&\
        apt-get -y clean all &&\
        curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

RUN /bin/bash -c \
        "source $NVM_DIR/nvm.sh \
        && nvm install $NODE_VERSION \
        && nvm alias default $NODE_VERSION \
        && nvm use default"
 
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# deploy middleware
WORKDIR /app
COPY . /app
RUN rm -rf node_modules && npm install

CMD ["npm", "start"]
