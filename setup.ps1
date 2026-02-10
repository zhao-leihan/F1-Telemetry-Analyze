# F1 Telemetry Analyzer - Setup Script (Windows PowerShell)
# This script sets up the entire system from scratch

Write-Host "🏎️  F1 Telemetry Analyzer - Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "1. Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host ""
Write-Host "2. Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 20+" -ForegroundColor Red
    exit 1
}

# Backend setup
Write-Host ""
Write-Host "3. Setting up backend..." -ForegroundColor Yellow
Set-Location backend

Write-Host "  - Creating virtual environment..."
python -m venv venv

Write-Host "  - Activating virtual environment..."
& .\venv\Scripts\Activate.ps1

Write-Host "  - Installing Python dependencies..."
pip install -q -r requirements.txt
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

Set-Location ..

# ML model training
Write-Host ""
Write-Host "4. Training ML model..." -ForegroundColor Yellow
Write-Host "  (This may take 1-2 minutes...)" -ForegroundColor Gray
Set-Location ml

python model_training.py

if (Test-Path "models\lap_time_model.joblib") {
    Write-Host "  ✓ ML model trained successfully" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Model training may have failed, but system will use fallback predictions" -ForegroundColor Yellow
}

Set-Location ..

# Frontend setup
Write-Host ""
Write-Host "5. Setting up frontend..." -ForegroundColor Yellow
Set-Location frontend

Write-Host "  - Installing Node.js dependencies..."
npm install --silent
Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start PostgreSQL (or use Docker):"
Write-Host "     docker-compose up postgres -d"
Write-Host ""
Write-Host "  2. Start the backend (in new terminal):"
Write-Host "     cd backend"
Write-Host "     .\venv\Scripts\Activate.ps1"
Write-Host "     uvicorn main:app --reload"
Write-Host ""
Write-Host "  3. Start the frontend (in new terminal):"
Write-Host "     cd frontend"
Write-Host "     npm run dev"
Write-Host ""
Write-Host "  4. Generate and upload sample data (in new terminal):"
Write-Host "     cd ml"
Write-Host "     python upload_data.py"
Write-Host ""
Write-Host "  5. Open dashboard:"
Write-Host "     http://localhost:3000"
Write-Host ""
Write-Host "OR use Docker for everything:" -ForegroundColor Yellow
Write-Host "  docker-compose up"
Write-Host ""
Write-Host "🏎️  Happy analyzing!" -ForegroundColor Cyan
