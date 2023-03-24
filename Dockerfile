FROM ghcr.io/diploi/nextjs-postgresql-template

# Install application code
WORKDIR /app
COPY . .

# Fake status success
RUN touch /tmp/pod-ready

RUN npm install
RUN npm run build