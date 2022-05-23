FROM debian:bullseye

MAINTAINER Giuseppe Morelli <hello@giuseppemorelli.net>

RUN apt-get update \
    && apt-get dist-upgrade -y \
    && apt-get install curl -y

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs

RUN apt-get clean \
    && rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/* \
    /usr/share/man \
    /usr/share/doc \
    /usr/share/doc-base

VOLUME /app

COPY ./ /app

RUN cd /app \
    && npm install \
    && npm run tsc \
    && npm install --only-prod

CMD ["/app/docker/entrypoint.sh"]
