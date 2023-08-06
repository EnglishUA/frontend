FROM node as builder

ARG appDir=/app/src/english-ua-frontend/
RUN mkdir -p $appDir
WORKDIR $appDir

COPY ./ $appDir
RUN npm install
RUN npm run build

FROM nginx:1.25.1-alpine

COPY --from=builder /app/src/english-ua-frontend/build /usr/share/nginx/html

COPY --from=builder /app/src/english-ua-frontend/docs/nginx-ref/static-react-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
