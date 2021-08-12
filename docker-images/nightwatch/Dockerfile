FROM node:14

WORKDIR /app

ARG GIT_LFS_VERSION=2.13.3

RUN wget https://github.com/git-lfs/git-lfs/releases/download/v${GIT_LFS_VERSION}/git-lfs-linux-amd64-v${GIT_LFS_VERSION}.tar.gz && \
  tar xf git-lfs-linux-amd64-v${GIT_LFS_VERSION}.tar.gz && \
  mv git-lfs /usr/local/bin/git-lfs && \
  git lfs help && \
  rm git-lfs-linux-amd64-v${GIT_LFS_VERSION}.tar.gz && \
  git lfs install

RUN touch .env
ENV CI true
