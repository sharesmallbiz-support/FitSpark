#!/usr/bin/env pwsh

Write-Host "Building FitSpark Application..." -ForegroundColor Green

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}

# Check if dotnet is available
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "dotnet CLI is not installed or not in PATH"
    exit 1
}

# Install npm dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install npm dependencies"
    exit 1
}

# Build the React client application
Write-Host "Building React client application..." -ForegroundColor Yellow
npm run build:client

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build client application"
    exit 1
}

# Build the .NET API
Write-Host "Building .NET API..." -ForegroundColor Yellow
dotnet build FitSpark.Api/FitSpark.Api.csproj --configuration Release

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build API"
    exit 1
}

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "To run the application:" -ForegroundColor Cyan
Write-Host "  dotnet run --project FitSpark.Api/FitSpark.Api.csproj" -ForegroundColor White
Write-Host "Or for production:" -ForegroundColor Cyan
Write-Host "  dotnet run --project FitSpark.Api/FitSpark.Api.csproj --configuration Release" -ForegroundColor White
