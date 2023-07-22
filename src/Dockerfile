FROM node:18

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3005
CMD [ "npx", "ts-node", "/usr/src/app/bin/www" ]