# FitSpark - Personalized Fitness Platform

## Overview

FitSpark is a personalized 30-day fitness platform designed specifically for men over 55. The application provides customized workout programs with three distinct motivational themes (Fun, Aggressive, and Drill Sergeant), progress tracking, achievement systems, and AI-powered personalization. Users receive daily workout plans featuring chair yoga, light weights, walking routines, and elliptical exercises, with integrated YouTube video content and motivational messaging.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Primary Database**: PostgreSQL using Neon serverless
- **Schema Design**: 
  - Users table with fitness metrics and theme preferences
  - Workout plans with JSON exercise arrays and AI-generated content
  - Videos table for YouTube integration with exercise categorization
  - Daily progress tracking with mood and completion metrics
  - Achievement system with badge types and unlocking logic

### Authentication and Authorization
- **Registration Flow**: Multi-step with fitness goals, weight targets, and theme selection
- **Session Management**: Client-side localStorage with server-side validation
- **Admin System**: Role-based access for video management and user oversight
- **Security**: Bcrypt password hashing with input validation using Zod schemas

### External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI API for personalized content generation
- **Video Content**: YouTube embedded player integration
- **UI Framework**: Radix UI primitives for accessible components
- **Build Tools**: Vite with TypeScript, PostCSS, and Autoprefixer
- **Deployment**: Replit-optimized with development banner and cartographer integration