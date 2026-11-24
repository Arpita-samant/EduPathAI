# EduPath AI Startup Script for PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   EduPath AI - Full-Stack SaaS Career Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting FastAPI Backend (port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting Vite Frontend (port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API: http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Interactive Swagger Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  1-Click Demo Login is active on the landing page!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
