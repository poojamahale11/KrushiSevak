# KrushiSevak Frontend Startup Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  KrushiSevak Frontend Application Startup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "Checking backend server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-Host "✓ Backend server is running!" -ForegroundColor Green
    } else {
        throw "Backend health check returned unexpected status: $($response.StatusCode)"
    }
}
catch {
    Write-Host "WARNING: Backend server is not responding on http://localhost:5000" -ForegroundColor Red
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  Run start-backend.ps1 in another terminal" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the frontend server
Write-Host "Starting frontend development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Once started, open your browser to:" -ForegroundColor Green
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
npm run dev -- --host 0.0.0.0
