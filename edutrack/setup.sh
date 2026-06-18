#!/bin/bash
# EduTrack — WSL2 Setup Script
# Run once from any directory: bash setup.sh
# Creates ~/projects/edutrack, installs all dependencies, and copies .env

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  _____ _         _____               _    "
echo " | ____| |__  _ _|_   _| __ __ _  ___| | __"
echo " |  _| | '_ \| | | | || '__/ _\` |/ __| |/ /"
echo " | |___| |_) | |_| | || | | (_| | (__|   < "
echo " |_____|_.__/ \__,_|_||_|  \__,_|\___|_|\_\\"
echo -e "${NC}"
echo "  MERN Stack Student Management System"
echo "  Aditya University — Advanced MERN Stack Development"
echo ""

# 1. Check Node
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not found. Installing via nvm...${NC}"
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
fi

echo -e "${GREEN}✓ Node $(node -v)${NC}"

# 2. Create project directory
mkdir -p ~/projects
DEST=~/projects/edutrack

if [ -d "$DEST" ]; then
  echo -e "${YELLOW}Directory $DEST already exists. Skipping copy.${NC}"
else
  cp -r "$(dirname "$0")" "$DEST"
  echo -e "${GREEN}✓ Project copied to $DEST${NC}"
fi

# 3. Server setup
echo ""
echo -e "${CYAN}Installing server dependencies...${NC}"
cd "$DEST/server"

if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠  Created server/.env from .env.example — edit it before running!${NC}"
fi

npm install
echo -e "${GREEN}✓ Server dependencies installed${NC}"

# 4. Client setup
echo ""
echo -e "${CYAN}Installing client dependencies...${NC}"
cd "$DEST/client"
npm install
echo -e "${GREEN}✓ Client dependencies installed${NC}"

# 5. Done
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  EduTrack is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Next steps:"
echo "  1. Edit  ~/projects/edutrack/server/.env  (set MONGO_URI, JWT_SECRET, SMTP_*)"
echo "  2. Start MongoDB:   sudo service mongodb start"
echo "  3. Run server:      cd ~/projects/edutrack/server && npm run dev"
echo "  4. Run client:      cd ~/projects/edutrack/client && npm run dev"
echo "  5. Open browser:    http://localhost:5173"
echo ""
echo "  Register your first admin account via:"
echo "  POST http://localhost:5000/api/auth/register"
echo '  Body: {"name":"Your Name","email":"admin@aditya.ac.in","password":"secret","role":"admin"}'
echo ""
