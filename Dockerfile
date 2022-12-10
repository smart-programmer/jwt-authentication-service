
# set base image
FROM node:current-alpine AS first
# copy host app files to container
COPY . /app/src
# set working directory inside the container
WORKDIR /app/src
# install dependencies
RUN [ "npm", "i"]
RUN [ "npm", "i", "nodemon", "-g" ]
RUN [ "apk", "add", "git" ]
# set entrypoint
ENTRYPOINT [ "nodemon", "./authn_service/index.js" ]





