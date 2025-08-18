# Use official .NET runtime as base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

# Use .NET SDK for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Install Node.js for building React client
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Copy package files
COPY package*.json ./
COPY FitSpark.Api/*.csproj ./FitSpark.Api/

# Restore dependencies
RUN npm ci --only=production
RUN dotnet restore FitSpark.Api/FitSpark.Api.csproj

# Copy all source files
COPY . .

# Build React client (outputs to FitSpark.Api/wwwroot)
RUN npm run build

# Build .NET API
WORKDIR /src/FitSpark.Api
RUN dotnet build -c Release -o /app/build

# Publish .NET API
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Final runtime image
FROM base AS final
WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000;https://+:5001

ENTRYPOINT ["dotnet", "FitSpark.Api.dll"]
