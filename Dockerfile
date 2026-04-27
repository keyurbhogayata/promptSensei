# Stage 1: Build the TypeScript project
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (including devDependencies needed for TypeScript compilation)
RUN npm ci

# Copy the rest of the source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Install git since PromptSensei uses simple-git to analyze the working tree
RUN apk add --no-cache git

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies for a smaller image size
RUN npm ci --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# The MCP server communicates via stdin/stdout
ENTRYPOINT ["node", "dist/mcp-server.js"]
