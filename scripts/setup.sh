#!/bin/bash

# Noca Setup Script
# Installs and configures Noca for first-time use

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ███╗   ██╗ ██████╗  ██████╗ █████╗                        ║"
echo "║   ████╗  ██║██╔═══██╗██╔════╝██╔══██╗                       ║"
echo "║   ██╔██╗ ██║██║   ██║██║     ███████║                       ║"
echo "║   ██║╚██╗██║██║   ██║██║     ██╔══██║                       ║"
echo "║   ██║ ╚████║╚██████╔╝╚██████╗██║  ██║                       ║"
echo "║   ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝                       ║"
echo "║                                                              ║"
echo "║   Zero-friction capture, AI-powered organization            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
NOCA_DIR="$HOME/noca"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed. Please install Node.js 18+ first.${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm is not installed.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Claude CLI (optional)
if command -v claude &> /dev/null; then
  echo -e "${GREEN}✓ Claude CLI is installed${NC}"
else
  echo -e "${YELLOW}! Claude CLI not found. Install it for AI processing:${NC}"
  echo "  npm install -g @anthropic-ai/claude-cli"
fi

# Step 2: Install dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
cd "$PROJECT_DIR"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Build project
echo -e "\n${YELLOW}Step 3: Building project...${NC}"
npm run build
echo -e "${GREEN}✓ Project built${NC}"

# Step 4: Create noca directory
echo -e "\n${YELLOW}Step 4: Creating Noca directory...${NC}"
mkdir -p "$NOCA_DIR/captures"
mkdir -p "$NOCA_DIR/processed"
echo -e "${GREEN}✓ Created $NOCA_DIR${NC}"

# Step 5: Setup Notion (optional)
echo -e "\n${YELLOW}Step 5: Notion Integration (optional)${NC}"
echo ""
echo "To push processed captures to Notion, you need to:"
echo ""
echo "  1. Create an Integration at https://www.notion.so/my-integrations"
echo "  2. Copy the 'Internal Integration Token'"
echo "  3. Create a page in Notion for your daily captures"
echo "  4. Share the page with your integration (... → Add connections)"
echo "  5. Copy the page ID from the URL"
echo ""

if [ -f "$NOCA_DIR/config.json" ]; then
  echo -e "${GREEN}✓ Config file already exists at $NOCA_DIR/config.json${NC}"
else
  read -p "Would you like to configure Notion now? (y/n) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Notion Integration Token: " NOTION_TOKEN
    read -p "Enter your Notion Page ID: " NOTION_PAGE_ID

    cat > "$NOCA_DIR/config.json" << EOF
{
  "notion": {
    "token": "$NOTION_TOKEN",
    "pageId": "$NOTION_PAGE_ID"
  },
  "storage": {
    "path": "~/noca"
  }
}
EOF
    echo -e "${GREEN}✓ Config file created at $NOCA_DIR/config.json${NC}"
  else
    echo -e "${YELLOW}! Skipping Notion configuration. You can set it up later.${NC}"
    echo "  Create $NOCA_DIR/config.json with:"
    echo '  {'
    echo '    "notion": {'
    echo '      "token": "secret_your_token",'
    echo '      "pageId": "your_page_id"'
    echo '    }'
    echo '  }'
  fi
fi

# Step 6: Setup Raycast extension
echo -e "\n${YELLOW}Step 6: Raycast Extension${NC}"
echo ""
echo "To use the Raycast capture extension:"
echo ""
echo "  1. Open Raycast"
echo "  2. Go to Extensions → Add Extension → Import Extension"
echo "  3. Select the directory: $PROJECT_DIR/src/raycast"
echo "  4. Run 'npm install' in the raycast directory"
echo ""
echo -e "${BLUE}Note: The Raycast extension requires Raycast to be installed.${NC}"

# Step 7: Add to PATH (optional)
echo -e "\n${YELLOW}Step 7: Add scripts to PATH (optional)${NC}"
echo ""
echo "To run qc-process from anywhere, add this to your shell config:"
echo ""
echo "  export PATH=\"\$PATH:$PROJECT_DIR/scripts\""
echo ""

# Done
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🎉 Noca setup complete!                                    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "Quick start:"
echo ""
echo "  1. Capture something using Raycast extension"
echo "  2. Process today's captures:"
echo "     ./scripts/qc-process"
echo ""
echo "  3. Process and push to Notion:"
echo "     ./scripts/qc-process --push"
echo ""
echo "For help:"
echo "  ./scripts/qc-process --help"
echo ""
