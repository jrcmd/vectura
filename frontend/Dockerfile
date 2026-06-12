# ============================================
# VECTURA FRONTEND — Dockerfile Production
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

RUN apk add --no-cache curl

COPY --from=builder /app/dist /var/www/html
COPY nginx-conf/maintenance.html /var/www/html/maintenance.html

# Nginx config for frontend
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx-conf/app.vectura.fr /etc/nginx/templates/frontend.conf.template

EXPOSE 4173

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:4173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]