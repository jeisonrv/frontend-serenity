# Build with: docker build -t serenity-frontend:1.0.0 .
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27.5-alpine

LABEL org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.title="Serenity Frontend" \
      org.opencontainers.image.source="https://github.com/jeisonrv/frontend-serenity"

COPY --from=build /app/dist/serenity-frontend/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY config.template.json /usr/share/nginx/html/config.template.json
COPY docker-entrypoint.sh /usr/local/bin/serenity-entrypoint.sh

USER root
RUN chmod 755 /usr/local/bin/serenity-entrypoint.sh \
    && chown -R nginx:nginx /usr/share/nginx/html
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1

ENTRYPOINT ["/usr/local/bin/serenity-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
