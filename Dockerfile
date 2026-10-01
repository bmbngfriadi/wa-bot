FROM node:20-alpine

# Install Chromium for whatsapp-web.js (Puppeteer)
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    tzdata

# Tell Puppeteer to skip installing Chrome and use the installed one
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    TZ=Asia/Jakarta

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5005
