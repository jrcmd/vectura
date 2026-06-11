FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:4173/ || exit 1

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

