FROM bitnami/node:20

ENV PORT=8080
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN apt-get update && apt-get install -y ffmpeg curl && \
  curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl && \
  chmod a+rx /usr/local/bin/youtube-dl

WORKDIR /app
COPY . .
RUN yarn install && yarn build

EXPOSE $PORT

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]

CMD ["node", "node_modules/.bin/next", "start"]
