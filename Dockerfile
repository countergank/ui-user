# Build stage: compile the Vite SPA into static assets
FROM node:22-alpine AS build
WORKDIR /app

# Environment baked into the bundle at build time (ADR-11). These are build-args so
# the correct mode's values can be supplied per environment (e.g. `doppler run` /
# `docker compose build --build-arg VITE_API_BASE_URL=...`). They are NOT used at runtime.
#
# VITE_MODE drives `vite build --mode` (dev / staging / production) and therefore the
# `envMode` badge value. Default "production" matches `pnpm build`.
ARG VITE_API_BASE_URL
ARG VITE_MODE=production
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_MODE=$VITE_MODE

# Enable pnpm via corepack (matches packageManager in package.json)
RUN corepack enable

# Install dependencies first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm exec tsc -b && pnpm exec vite build --mode "$VITE_MODE"

# Runtime stage: serve the static build with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
