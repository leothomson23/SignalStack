FROM nginx:alpine

RUN apk add --no-cache openssl

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY ssl/generate-cert.sh /usr/local/bin/generate-cert.sh

RUN chmod +x /entrypoint.sh /usr/local/bin/generate-cert.sh

ENTRYPOINT ["/entrypoint.sh"]
