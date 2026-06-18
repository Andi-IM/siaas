# Menggunakan Ubuntu 22.04 LTS sebagai base image yang stabil
FROM ubuntu:22.04

# Mencegah prompt interaktif saat instalasi package
ENV DEBIAN_FRONTEND=noninteractive

# 1. Install sistem dependencies dasar
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    pkg-config \
    git \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    libappindicator3-dev \
    librsvg2-dev \
    patchelf \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js 22 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 3. Install pnpm
RUN npm install -g pnpm@10.18.0

# 4. Install Rust Toolchain
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# 5. Install cargo-nextest untuk testing yang lebih cepat
RUN cargo install cargo-nextest --locked

# Set working directory default
WORKDIR /app

# Perintah default (opsional)
CMD ["bash"]
