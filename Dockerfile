# Install dependencies only when needed
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app
COPY package.json package-lock.json ./

ENV NODE_ENV production

RUN npm ci --omit=dev

COPY . .

COPY --from=deps /app/dist ./dist

EXPOSE 8080

ENV PORT 8080

CMD ["node", "dist/src/main"]