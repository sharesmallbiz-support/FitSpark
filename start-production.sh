#!/bin/bash
# FitSpark Production Startup Script

echo "🚀 Starting FitSpark Application..."

# Set production environment
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS="http://0.0.0.0:5000;https://0.0.0.0:5001"

# Ensure database directory exists
mkdir -p /app/data

# Start the application
echo "🌐 Starting server on ports 5000 (HTTP) and 5001 (HTTPS)..."
dotnet FitSpark.Api.dll
