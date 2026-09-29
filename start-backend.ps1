# KrushiSevak Backend Startup Script
Write-Host "================================================" -ForegroundColor Green
Write-Host "  KrushiSevak Backend Server Startup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
$mongoCheck = $null
try {
    $mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
} catch {
    $mongoCheck = $false
}

if (-not $mongoCheck) {
    Write-Host "WARNING: Cannot connect to MongoDB on port 27017" -ForegroundColor Red
    Write-Host "Please start MongoDB service first:" -ForegroundColor Yellow
    Write-Host "  net start MongoDB" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\backend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the backend server
Write-Host "Starting backend server on http://localhost:5000..." -ForegroundColor Green
Write-Host ""
node server.js
