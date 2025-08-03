FROM node:18-alpine AS playwright-build

WORKDIR /app/playwright
COPY servers/playwright/package*.json ./
RUN npm ci
COPY servers/playwright/ ./
RUN npm run build

# Install Playwright browsers
RUN npx playwright install --with-deps chromium

FROM python:3.12-slim AS python-base

# Install Node.js for Playwright MCP
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright system dependencies
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libgbm-dev \
    libxss1 \
    libasound2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/mcp

# Copy Python MCP servers
COPY servers/context7/ ./servers/context7/
COPY servers/sequential-thinking/ ./servers/sequential-thinking/

# Install Python dependencies
RUN cd servers/context7 && pip install -e . && \
    cd ../sequential-thinking && pip install -e .

# Copy Playwright build
COPY --from=playwright-build /app/playwright/build ./servers/playwright/build/
COPY --from=playwright-build /app/playwright/node_modules ./servers/playwright/node_modules/
COPY --from=playwright-build /usr/lib/playwright /usr/lib/playwright

# Copy configuration
COPY config/ ./config/

# Set environment variables for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/lib/playwright
ENV PLAYWRIGHT_HEADLESS=true

# Create startup script
RUN echo '#!/bin/bash\n\
echo "Starting MCP Servers..."\n\
echo "Available MCP servers:"\n\
echo "- Playwright: node /app/mcp/servers/playwright/build/index.js"\n\
echo "- Context7: python -m context7_mcp"\n\
echo "- Sequential Thinking: python -m sequential_thinking_mcp"\n\
echo ""\n\
echo "MCP configuration available at: /app/mcp/config/mcp.json"\n\
echo ""\n\
while true; do sleep 30; done\n\
' > /app/start-mcp.sh && chmod +x /app/start-mcp.sh

EXPOSE 3001

CMD ["/app/start-mcp.sh"]