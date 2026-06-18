FROM node:lts-alpine3.24

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production

CMD ["node", "src/main.js"]