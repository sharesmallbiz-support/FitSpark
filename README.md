# FitSpark - Personalized Fitness Platform

## Overview

FitSpark is a personalized 30-day fitness platform designed specifically for people over 55. The application provides customized workout programs with three distinct motivational themes (Fun, Aggressive, and Drill Sergeant), progress tracking, achievement systems, and AI-powered personalization. Users receive daily workout plans featuring chair yoga, light weights, walking routines, and elliptical exercises, with integrated YouTube video content and motivational messaging.

## User Preferences

Preferred communication style: Simple, everyday language.
Inclusivity: Application should use gender-neutral language for all people over 55, not specifically targeting men.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state with React Context for local state (authentication and theming)
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS custom properties for dynamic theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture

- **Framework**: .NET 9 Web API with Entity Framework Core
- **Database**: SQLite with Entity Framework migrations
- **Authentication**: BCrypt for password hashing with comprehensive user management
- **API Documentation**: Swagger/OpenAPI integration
- **CORS**: Configured for both development and production scenarios

### Unified Deployment

The application is now configured as a single deployment unit:

- The React frontend is built and served from the .NET API's `wwwroot` folder
- Both client and API are served from the same origin
- SPA routing is handled by fallback to `index.html`
- API endpoints are available at `/api/*` routes

### Data Storage Solutions

- **Primary Storage**: SQLite database with Entity Framework Core
- **Comprehensive Models**: Users, Workout Plans, Daily Workouts, Exercises, Progress Tracking, Videos, Achievements
- **Mock Data**: DataSeedingService provides initial data for evaluation
- **Achievement System**: Points, badges, and leaderboard functionality

### Authentication and Authorization

- **Registration Flow**: Comprehensive user registration with fitness metrics
- **Session Management**: API-based authentication with user roles
- **Admin System**: Role-based access for content management
- **Security**: BCrypt password hashing with comprehensive input validation

### Build and Deployment

#### Quick Start

```bash
# Install dependencies
npm install

# Build and run the application
./build.ps1
dotnet run --project FitSpark.Api/FitSpark.Api.csproj
```

#### Development Workflow

```bash
# For full-stack development (recommended)
dotnet run --project FitSpark.Api/FitSpark.Api.csproj

# For client-only development with hot reload
npm run dev  # Uses proxy to API at localhost:5000
```

#### Build Commands

```bash
npm run build:client    # Builds React app to FitSpark.Api/wwwroot
npm run build:api       # Builds .NET API
npm run build:all       # Builds both client and API
npm run start:api       # Builds and runs the unified application
```

#### Production Deployment

```bash
# Build for production
npm run build:all

# Run production server
dotnet run --project FitSpark.Api/FitSpark.Api.csproj --configuration Release
```

The application will be available at the configured port (default: <https://localhost:7000> for development, <https://localhost:5001> for production) serving both the API and the client application.

### Evaluation Setup

- **Demo Users**: Pre-configured accounts for immediate testing
  - Regular User: username: `demo`, password: `demo123`
  - Admin User: username: `admin`, password: `demo123`
- **Database**: SQLite database with seeded data including users, workouts, progress, and achievements
- **Single Port**: Both API and client served from the same port for simplified deployment
