# Start the Vite React Frontend Development Server
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting WanderWise Travel Planner Frontend" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

$FrontendDir = Join-Path $PSScriptRoot "frontend"

if (-Not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "[!] node_modules not found in frontend directory." -ForegroundColor Yellow
    Write-Host "[*] Running npm install..." -ForegroundColor Cyan
    npm --prefix $FrontendDir install
}

Write-Host "[+] Local web application: http://localhost:5173" -ForegroundColor Cyan
npm --prefix $FrontendDir run dev
