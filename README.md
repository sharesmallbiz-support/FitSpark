# FitSpark 🔥💪

> A personalized 30-day fitness platform designed specifically for people over 55, featuring three distinct motivational themes, progress tracking, and achievement systems.

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/download)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

FitSpark empowers people over 55 to embark on a personalized fitness journey with customized workout programs, daily motivation, and comprehensive progress tracking. Choose from three distinct motivational themes—**Fun & Encouraging**, **Aggressive & Intense**, or **Drill Sergeant Style**—and enjoy daily workout plans featuring chair yoga, light weights, walking routines, and elliptical exercises.

### ✨ Key Features

- 🏋️ **Personalized Workout Plans** - Custom 30-day programs tailored to your fitness level
- 🎭 **Three Motivational Themes** - Choose your preferred coaching style
- 📊 **Progress Tracking** - Comprehensive analytics and visual progress charts
- 🏆 **Achievement System** - Badges, points, and leaderboards for motivation
- 🎥 **Video Integration** - YouTube workout videos with ratings and categories
- 📱 **Responsive Design** - Seamless experience across all devices
- 👥 **User Profiles** - Comprehensive fitness metrics and preferences
- 🔐 **Secure Authentication** - Role-based access with admin controls

## 🚀 Quick Start

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) and npm
- PowerShell (Windows) or Bash (Linux/macOS)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sharesmallbiz-support/FitSpark.git
   cd FitSpark
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build and run the application**

   ```bash
   # Windows
   .\build.ps1
   
   # Or manually
   npm run build:all
   dotnet run --project FitSpark.Api/FitSpark.Api.csproj
   ```

4. **Access the application**
   - Development: <https://localhost:7033> or <http://localhost:5155>
   - Production: <https://localhost:5001>

### Demo Accounts

- **Regular User**: `demo` / `demo123`
- **Admin User**: `admin` / `demo123`

## 🏗️ Architecture

### Technology Stack

#### Frontend

- **React 19.1.1** with TypeScript 5.9.2
- **Vite 7.1.2** for fast development and optimized builds
- **Wouter 3.7.1** for lightweight client-side routing
- **TanStack Query 5.85.3** for server state management
- **Radix UI + shadcn/ui** component system (New York style)
- **Tailwind CSS 3.4.17** with CSS custom properties
- **React Hook Form 7.62.0** with Zod 4.0.17 validation
- **Framer Motion 12.23.12** for animations
- **Recharts 3.1.2** for data visualization

#### Backend

- **.NET 9.0.304** Web API with ASP.NET Core
- **Entity Framework Core 9.0.8** with SQLite
- **BCrypt.Net-Next 4.0.3** for secure password hashing
- **Swagger/OpenAPI** for API documentation

### Project Structure

```text
FitSpark/
├── client/src/                    # React TypeScript frontend
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── AchievementsPanel.tsx
│   │   ├── DailyMotivation.tsx
│   │   ├── Navigation.tsx
│   │   ├── ProgressChart.tsx
│   │   ├── TodaysWorkout.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── WeightLogModal.tsx
│   │   ├── WelcomeWizard.tsx
│   │   └── WorkoutModal.tsx
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   │   ├── apiConfig.ts
│   │   ├── apiService.ts
│   │   ├── queryClient.ts
│   │   ├── themes.ts
│   │   └── utils.ts
│   ├── pages/                   # Route components
│   │   ├── Admin.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Progress.tsx
│   │   ├── Register.tsx
│   │   ├── UserProfile.tsx
│   │   ├── WorkoutPlan.tsx
│   │   ├── WorkoutPlans.tsx
│   │   └── not-found.tsx
│   └── types/                   # TypeScript definitions
│       ├── api.ts
│       └── client.ts
├── FitSpark.Api/                 # .NET Web API backend
│   ├── Controllers/             # API controllers
│   │   ├── AchievementsController.cs
│   │   ├── AuthController.cs
│   │   ├── HealthController.cs
│   │   ├── ProgressController.cs
│   │   ├── VideosController.cs
│   │   └── WorkoutsController.cs
│   ├── Data/                    # Entity Framework
│   │   └── FitSparkDbContext.cs
│   ├── DTOs/                    # Data Transfer Objects
│   ├── Models/                  # Entity models
│   │   ├── Achievement.cs
│   │   ├── DailyProgress.cs
│   │   ├── Exercise.cs
│   │   ├── User.cs
│   │   ├── Video.cs
│   │   └── WorkoutPlan.cs
│   ├── Services/                # Business logic
│   │   ├── AuthService.cs
│   │   ├── DataSeedingService.cs
│   │   └── WorkoutService.cs
│   └── wwwroot/                 # Static files (React build)
├── copilot/                     # Documentation
│   ├── copilot-instructions.md
│   └── API_INTEGRATION_SUMMARY.md
├── build.ps1                    # Build script
└── package.json                 # Node.js dependencies
```

### Unified Deployment

FitSpark uses a modern unified deployment architecture:

- **Single Server**: React frontend served from .NET API's `wwwroot`
- **Same Origin**: Eliminates CORS complexity
- **SPA Routing**: Fallback to `index.html` for client-side routes
- **API Endpoints**: Available at `/api/*` routes

## 🛠️ Development

### Development Workflow

```bash
# Full-stack development (recommended)
dotnet run --project FitSpark.Api/FitSpark.Api.csproj

# Client-only development with hot reload
npm run dev  # Proxies API requests to localhost:5155

# Build commands
npm run build:client    # Build React app to API wwwroot
npm run build:api       # Build .NET API
npm run build:all       # Build both client and API
npm run start:api       # Build and run unified application
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with API proxy |
| `npm run build` | Build client application |
| `npm run build:api` | Build .NET API |
| `npm run build:all` | Build both client and API |
| `npm run build:production` | Production build |
| `npm run start:api` | Run unified application |
| `npm run clean` | Clean build outputs |
| `npm run restore` | Restore all dependencies |
| `npm run check` | TypeScript type checking |
| `npm run preview` | Preview production build |

### 📊 Development Analytics

The project includes powerful development analytics tools in the `/scripts` directory:

- **Git Activity Reports**: Comprehensive repository analysis with code churn metrics, author productivity, and best practices assessment
- **Multiple Output Formats**: HTML reports with visualizations, JSON for CI/CD integration, and console output for quick reviews
- **Quality Insights**: Automated recommendations for code quality, commit patterns, and development workflow improvements

```bash
# Generate a beautiful HTML report for the last 7 days
.\scripts\Generate-GitActivityReport.ps1 -Days 7 -Format HTML

# Quick console overview for standups
.\scripts\Quick-GitReport.ps1 -Preset Daily -Format Console

# Windows GUI launcher (double-click to run)
.\scripts\RunGitReport.bat
```

See the [scripts README](scripts/README.md) for detailed documentation and examples.

### Database Management

```bash
# Add migration
dotnet ef migrations add MigrationName --project FitSpark.Api

# Update database
dotnet ef database update --project FitSpark.Api

# Reset database (development)
rm FitSpark.Api/FitSpark.db
dotnet run --project FitSpark.Api/FitSpark.Api.csproj
```

## 🌟 Features in Detail

### Workout Management

- Create personalized 30-day workout plans
- Choose from Beginner, Intermediate, and Advanced difficulty levels
- Select motivational themes: Fun, Aggressive, or Drill Sergeant
- Daily workout tracking with exercise completion

### Progress Tracking

- Comprehensive progress analytics with visual charts
- Weight logging and body measurements
- Exercise performance metrics
- Daily progress notes and reflections

### Achievement System

- Points-based achievement system
- Badge collection for milestones
- Leaderboards for friendly competition
- Category-based achievements (Consistency, Strength, Cardio, etc.)

### Video Integration

- Curated YouTube fitness videos
- User ratings and reviews
- Category filtering (Chair Yoga, Light Weights, Walking, etc.)
- Featured video recommendations

### User Experience

- Welcome wizard for new users
- Responsive design for all devices
- Dynamic theming with CSS custom properties
- Accessibility-focused UI components

## 🎨 UI/UX Design

### Design System

- **Component Library**: shadcn/ui (New York style)
- **Icons**: Lucide React + React Icons
- **Styling**: Tailwind CSS with CSS variables
- **Animation**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization

### Theming

Three distinct visual themes that match motivational styles:

- **Fun Theme**: Bright, energetic colors with playful elements
- **Aggressive Theme**: Bold, intense colors with strong contrast
- **Drill Theme**: Military-inspired, disciplined aesthetic

## 📱 API Documentation

### Endpoints

#### Authentication (`/api/auth/`)

- `POST /login` - User authentication
- `POST /register` - User registration
- `GET /user/{id}` - Get user profile
- `PUT /user/{id}` - Update user profile

#### Workouts (`/api/workouts/`)

- `GET /plans/user/{userId}` - Get user's workout plans
- `POST /plans/user/{userId}` - Create workout plan
- `GET /daily/{workoutId}/user/{userId}` - Get daily workout
- `POST /daily/user/{userId}` - Create daily workout

#### Progress (`/api/progress/`)

- `GET /user/{userId}` - Get user progress
- `POST /user/{userId}` - Log daily progress
- `GET /stats/user/{userId}` - Get progress statistics

#### Videos (`/api/videos/`)

- `GET /` - Get videos with filtering
- `GET /featured` - Get featured videos
- `POST /{videoId}/rating/user/{userId}` - Rate video

#### Achievements (`/api/achievements/`)

- `GET /` - Get all achievements
- `GET /user/{userId}` - Get user achievements
- `GET /leaderboard` - Get achievement leaderboard

### API Documentation

Access interactive Swagger documentation at `/swagger` when running in development mode.

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build:production

# Run production server
dotnet run --project FitSpark.Api/FitSpark.Api.csproj --configuration Release
```

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
npm run docker:run

# Stop containers
npm run docker:stop
```

### Environment Configuration

The application automatically configures for different environments:

- **Development**: Full CORS, detailed error messages, Swagger UI
- **Production**: Restricted CORS, optimized builds, security headers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the existing code style and patterns
4. Write tests for new functionality
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Code Style

- **Frontend**: Follow React/TypeScript best practices
- **Backend**: Follow C#/.NET conventions
- **Commits**: Use conventional commit messages
- **Testing**: Write unit tests for new features

## 📋 Requirements

### System Requirements

- **.NET 9.0 SDK** or later
- **Node.js 18+** and npm
- **4GB RAM** minimum (8GB recommended)
- **500MB** disk space

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [existing issues](../../issues) for solutions
2. [Open a new issue](../../issues/new) with detailed information
3. Include your environment details and steps to reproduce

For feature requests, please [open an issue](../../issues/new) with the "enhancement" label.

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by the need for accessible fitness solutions for people over 55
- Special thanks to the open-source community for the amazing tools and libraries

---

FitSpark - Empowering fitness journeys for people over 55! 💪✨
