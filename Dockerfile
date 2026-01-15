#stage: 1
FROM node:18.20.3-alpine3.20 as builder
WORKDIR /app
COPY package.json /app/
#COPY package-lock.json /app/
RUN npm install
COPY ./ /app
CMD ["npm", "start"]
RUN npm install esbuild --save-dev
RUN npm run build
#stage: 2
FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist  /usr/share/nginx/html
ENTRYPOINT [ "nginx" , "-g" , "daemon off;" ]
EXPOSE 5173

#
