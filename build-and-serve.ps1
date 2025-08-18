# Build and serve script for FitSpark
Write-Host "Building and serving FitSpark..." -ForegroundColor Green

# Build the client
Write-Host "Building React client..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Client build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Client built successfully!" -ForegroundColor Green

# Start the API server
Write-Host "Starting API server..." -ForegroundColor Yellow
Set-Location "FitSpark.Api"

# Set environment to Development to ensure proper configuration
$env:ASPNETCORE_ENVIRONMENT = "Development"

Write-Host "Server will be available at: http://localhost:5155" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

dotnet run
