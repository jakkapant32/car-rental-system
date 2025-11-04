FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Create uploads directories
RUN mkdir -p uploads/vehicles uploads/qr-codes

EXPOSE 3001

# Run migrations and start server
CMD ["sh", "-c", "npm run migrate && npm start"]


