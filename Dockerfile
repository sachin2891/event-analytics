FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the full codebase
COPY . .

# Install ts-node-dev and concurrently globally
RUN npm install -g ts-node-dev concurrently

# Expose backend port
EXPOSE 4000

# Start both server and worker
CMD ["npm", "run", "start:all"]
