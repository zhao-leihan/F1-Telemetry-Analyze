#!/bin/bash

# F1 Telemetry Analyzer - Setup Script
# This script sets up the entire system from scratch

echo "🏎️  F1 Telemetry Analyzer - Setup Script"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
echo "1. Checking Python installation..."
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
else
    echo -e "${RED}✗ Python not found. Please install Python 3.11+${NC}"
    exit 1
fi

# Check if Node.js is installed
echo ""
echo "2. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
echo ""
echo "3. Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓ PostgreSQL $PG_VERSION found${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found locally. Will use Docker instead.${NC}"
fi

# Backend setup
echo ""
echo "4. Setting up backend..."
cd backend

echo "  - Creating virtual environment..."
python -m venv venv

echo "  - Activating virtual environment..."
source venv/bin/activate 2>/dev/null || venv\Scripts\activate

echo "  - Installing Python dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"

cd ..

# ML model training
echo ""
echo "5. Training ML model..."
cd ml

echo "  - Generating training data..."
python -c "from model_training import main; main()" > /dev/null 2>&1 &
TRAIN_PID=$!

# Show progress
echo "  - Training in progress (this may take 1-2 minutes)..."
wait $TRAIN_PID

if [ -f "models/lap_time_model.joblib" ]; then
    echo -e "${GREEN}  ✓ ML model trained successfully${NC}"
else
    echo -e "${YELLOW}  ⚠ Model training may have failed, but system will use fallback predictions${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "6. Setting up frontend..."
cd frontend

echo "  - Installing Node.js dependencies..."
npm install --silent
echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"

cd ..

# Database setup
echo ""
echo "7. Database setup..."
echo "  - Checking for PostgreSQL..."

if command -v psql &> /dev/null; then
    echo "  - Creating database..."
    psql -U postgres -c "CREATE DATABASE f1_telemetry;" 2>/dev/null || echo "  (Database may already exist)"
    psql -U postgres -c "CREATE USER f1_user WITH PASSWORD 'f1_password';" 2>/dev/null || echo "  (User may already exist)"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE f1_telemetry TO f1_user;" 2>/dev/null
    echo -e "${GREEN}  ✓ Database configured${NC}"
else
    echo -e "${YELLOW}  ⚠ Using Docker for PostgreSQL (run docker-compose up)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the backend:"
echo "     cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "  2. Start the frontend (in new terminal):"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Generate and upload sample data (in new terminal):"
echo "     cd ml && python upload_data.py"
echo ""
echo "  4. Open dashboard:"
echo "     http://localhost:3000"
echo ""
echo "OR use Docker:"
echo "  docker-compose up"
echo ""
echo "🏎️  Happy analyzing!"
