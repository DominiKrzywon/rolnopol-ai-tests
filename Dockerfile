FROM mcr.microsoft.com/playwright:v1.58.2-jammy

WORKDIR /app

# Kopiujemy i instalujemy zależności
COPY package*.json ./
RUN npm install

# Kopiujemy pliki testów
COPY . .

# Komenda, która odpali testy wewnątrz kontenera
CMD ["npx", "playwright", "test"]