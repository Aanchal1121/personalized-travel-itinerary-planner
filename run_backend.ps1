# Start the FastAPI Backend using the project virtual environment
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Personalized Travel Itinerary Backend" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

$VenvPython = Join-Path $PSScriptRoot "backend\.venv\Scripts\python.exe"

if (-Not (Test-Path $VenvPython)) {
    Write-Host "[!] Virtual environment not found at backend\.venv" -ForegroundColor Red
    Write-Host "    Please run: python -m venv backend\.venv" -ForegroundColor Yellow
    Write-Host "    Then: .\backend\.venv\Scripts\pip install -r backend\requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "[+] Using Python: $VenvPython" -ForegroundColor Gray
Write-Host "[+] API Docs available at: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "[+] Health check endpoint: http://127.0.0.1:8000/health" -ForegroundColor Cyan

& $VenvPython -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
