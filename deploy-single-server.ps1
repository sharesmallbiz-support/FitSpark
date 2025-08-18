# FitSpark Single-Server Deployment Script
# This script builds both client and API for production deployment

Write-Host "🚀 FitSpark Single-Server Deployment" -ForegroundColor Green

# Step 1: Build React Client
Write-Host "📦 Building React Client..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Client build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Build .NET API
Write-Host "🏗️ Building .NET API..." -ForegroundColor Yellow
dotnet build FitSpark.Api/FitSpark.Api.csproj --configuration Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ API build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Publish .NET API (Optional - for production)
Write-Host "📤 Publishing .NET API..." -ForegroundColor Yellow
dotnet publish FitSpark.Api/FitSpark.Api.csproj --configuration Release --output ./publish

Write-Host "✅ Deployment build complete!" -ForegroundColor Green
Write-Host "📁 Published files in: ./publish" -ForegroundColor Cyan
Write-Host "🌐 Client files served from: FitSpark.Api/wwwroot" -ForegroundColor Cyan
