# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build
WORKDIR /app

# pnpm is provided through Node's Corepack.
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# @saintrelion/* packages are hosted on GitHub Packages.
# The token is mounted only for this install step and is not copied into the image.
RUN --mount=type=secret,id=sr_react_github_token \
    TOKEN="$(cat /run/secrets/sr_react_github_token)" && \
    pnpm config set --global "//npm.pkg.github.com/:_authToken" "$TOKEN" && \
    pnpm install --frozen-lockfile && \
    pnpm config delete --global "//npm.pkg.github.com/:_authToken"

COPY . .
RUN pnpm build

# Lightweight static production image.
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
