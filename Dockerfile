FROM node:20-slim

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --no-audit --no-fund --no-progress

COPY backend/server.js ./
COPY dist ./frontend/dist

ENV ADMIN_EMAIL=admin@smartstacks.dev
ENV ADMIN_PASSWORD_HASH=9c735c764b62f10575f6cd916e6259255a7b98475b1764b5c509c4c77bb9f98f
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
