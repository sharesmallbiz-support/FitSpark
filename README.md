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

- **Runtime**: Node.js with Express.js REST API
- **Type Safety**: Shared TypeScript schemas between client and server using Zod
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Bcrypt for password hashing with localStorage session management
- **AI Integration**: OpenAI GPT-4o for personalized workout generation and motivational content

### Data Storage Solutions

- **Primary Storage**: In-memory storage with comprehensive mock data for evaluation
- **Mock Data Includes**:
  - Demo users (regular user and admin) with pre-populated fitness metrics
  - Sample workout plans with AI-generated content structure
  - Video library with YouTube integration and exercise categorization
  - Multi-day progress tracking with mood and completion metrics
  - Achievement system with earned badges and progression logic

### Authentication and Authorization

- **Registration Flow**: Multi-step with fitness goals, weight targets, and theme selection
- **Session Management**: Client-side localStorage with server-side validation
- **Admin System**: Role-based access for video management and user oversight
- **Security**: Bcrypt password hashing with input validation using Zod schemas

### External Dependencies

- **AI Services**: OpenAI API for personalized content generation
- **Video Content**: YouTube embedded player integration
- **UI Framework**: Radix UI primitives for accessible components
- **Build Tools**: Vite with TypeScript, PostCSS, and Autoprefixer
// ...existing content...

### Evaluation Setup

- **Demo Users**: Pre-configured accounts for immediate testing
  - Regular User: username: `demo`, password: `demo123` (5 days progress)
  - Admin User: username: `admin`, password: `demo123` (full admin access)
- **Mock Data**: Complete dataset including progress, achievements, and video library
- **No Database Dependencies**: Fully functional with in-memory storage only
