# Multi-stage Dockerfile for building a Vite/React app and serving with nginx
FROM node:18-alpine AS builder
WORKDIR /app

# install dependencies (use package-lock.json / pnpm-lock.yaml if present)
COPY package*.json ./
RUN npm ci --silent

# copy sources and build
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Use a small custom nginx conf to enable SPA fallback
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]