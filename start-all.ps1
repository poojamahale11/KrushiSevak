# KrushiSevak Complete Website Startup Script
# This script starts both backend and frontend in separate windows

Write-Host "================================================" -ForegroundColor Magenta
Write-Host "  KrushiSevak Complete Website Startup" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

$scriptDir = $PSScriptRoot

# Start Backend in new window
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptDir\start-backend.ps1"

# Wait a moment for backend to initialize
Write-Host "Waiting 5 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "Starting Frontend Application..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptDir\start-frontend.ps1"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  Website Starting!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two new windows have been opened:" -ForegroundColor Yellow
Write-Host "  1. Backend Server (http://localhost:5000)" -ForegroundColor White
Write-Host "  2. Frontend Application (http://localhost:5173)" -ForegroundColor White
Write-Host ""
Write-Host "Once both servers are running, open your browser to:" -ForegroundColor Green
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
