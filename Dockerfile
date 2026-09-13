FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy test files
COPY . .

# Run tests inside the container
CMD ["npx", "playwright", "test"]
