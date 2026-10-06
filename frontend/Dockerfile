# ---- Stage 1: build ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY . .
RUN npm run build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["npm", "run", "start"]
