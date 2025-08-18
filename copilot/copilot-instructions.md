# GitHub Copilot Instructions for FitSpark

## Project Overview

FitSpark is a comprehensive personalized fitness platform built with a modern full-stack architecture featuring a React TypeScript frontend and .NET 9 Web API backend. The application is deployed as a unified single-server solution where the React client is served from the .NET API's wwwroot folder.

## Architecture & Technology Stack

### Frontend Architecture

- **Framework**: React 19.1.1 with TypeScript 5.9.2
- **Build Tool**: Vite 7.1.2 with custom configuration and path aliases
- **Routing**: Wouter 3.7.1 for lightweight client-side routing
- **State Management**: TanStack Query 5.85.3 for server state, React Context for local state
- **UI Components**: Radix UI primitives with shadcn/ui component system (New York style)
- **Styling**: Tailwind CSS 3.4.17 with CSS custom properties for dynamic theming
- **Form Handling**: React Hook Form 7.62.0 with Zod 4.0.17 validation
- **Animation**: Framer Motion 12.23.12 for smooth transitions
- **Icons**: Lucide React 0.539.0 and React Icons 5.5.0
- **Charts**: Recharts 3.1.2 for data visualization

### Backend Architecture

- **Framework**: .NET 9.0.304 Web API with ASP.NET Core
- **Database**: SQLite with Entity Framework Core 9.0.8
- **Authentication**: BCrypt.Net-Next 4.0.3 for password hashing
- **API Documentation**: Swagger/OpenAPI integration (Swashbuckle.AspNetCore 9.0.3)
- **CORS**: Configured for development (port 5155) and production scenarios
- **Development Ports**: HTTP 5155, HTTPS 7033

### Key Dependencies

- **Frontend**: React 19.1.1, TypeScript 5.9.2, Vite 7.1.2, TanStack Query 5.85.3, Radix UI components, Tailwind CSS 3.4.17, Framer Motion 12.23.12, Wouter 3.7.1, React Hook Form 7.62.0, Zod 4.0.17, Recharts 3.1.2
- **Backend**: .NET 9.0.304, Entity Framework Core 9.0.8, BCrypt.Net-Next 4.0.3, Swashbuckle.AspNetCore 9.0.3
- **Build Tools**: Vite 7.1.2, TypeScript 5.9.2, PostCSS 8.5.6, Autoprefixer 10.4.21

## File Structure Rules

### Client Code Organization

```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (auto-generated, New York style)
│   └── [ComponentName].tsx
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── pages/              # Route components
└── types/              # TypeScript type definitions
```

### Path Aliases (configured in vite.config.ts and tsconfig.json)

```
@/*          -> client/src/*
@shared/*    -> shared/*
@assets/*    -> attached_assets/*
```

### shadcn/ui Configuration

- **Style**: New York
- **TypeScript**: Enabled
- **Tailwind**: CSS variables enabled, neutral base color
- **Components**: Auto-generated in `@/components/ui`

### API Code Organization

```
FitSpark.Api/
├── Controllers/        # API controllers
├── Data/              # DbContext and database configuration
├── DTOs/              # Data Transfer Objects
├── Models/            # Entity Framework models
├── Services/          # Business logic services
└── wwwroot/           # Static files (React build output)
```

## Coding Standards & Best Practices

### TypeScript & React Standards

1. **Component Structure**:

   ```typescript
   // Use functional components with TypeScript
   interface ComponentProps {
     // Always define prop interfaces
   }

   export function ComponentName({ props }: ComponentProps) {
     // Component logic
   }
   ```

2. **API Integration**:

   - Use the established service layer in `lib/apiService.ts`
   - All API calls should go through centralized service functions
   - Maintain type safety with interfaces in `types/api.ts`
   - Use TanStack Query for server state management

3. **State Management**:

   - Use React Context for global state (auth, theme)
   - Use TanStack Query for server state
   - Use useState/useReducer for local component state

4. **Styling**:
   - Use Tailwind CSS classes with CSS variables for theming
   - Follow the established theming system in `lib/themes.ts`
   - Use CSS custom properties for dynamic theming
   - Leverage shadcn/ui components from `@/components/ui/` (New York style)
   - Use path aliases: `@/` for src, `@shared/` for shared components
   - Apply consistent color scheme using CSS variables (--primary, --secondary, etc.)

### C# & .NET Standards

1. **Controller Structure**:

   ```csharp
   [ApiController]
   [Route("api/[controller]")]
   public class ControllerName : ControllerBase
   {
       // Use dependency injection
       // Follow RESTful conventions
       // Return appropriate HTTP status codes
   }
   ```

2. **Entity Framework**:

   - Use the established DbContext in `Data/FitSparkDbContext.cs`
   - Follow entity configuration patterns in OnModelCreating
   - Use appropriate relationships and constraints

3. **Service Layer**:
   - Implement service interfaces
   - Use dependency injection
   - Follow single responsibility principle

## API Integration Patterns

### Frontend Service Pattern

```typescript
// In lib/apiService.ts
export const serviceName = {
  async methodName(params: Type): Promise<ReturnType> {
    const response = await fetch(API_ENDPOINTS.service.method(params));
    return handleApiResponse<ReturnType>(response);
  },
};
```

### Backend Controller Pattern

```csharp
[HttpGet("endpoint/{id}")]
public async Task<ActionResult<ResponseDto>> GetMethod(int id)
{
    try
    {
        var result = await _service.GetMethodAsync(id);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
```

## Database & Entity Framework

### Model Relationships

- Users have WorkoutPlans (one-to-many)
- WorkoutPlans have DailyWorkouts (one-to-many)
- DailyWorkouts have Exercises (one-to-many)
- Users have DailyProgress entries (one-to-many)
- Complex achievement and video rating systems

### Migration Commands

```bash
# Add migration
dotnet ef migrations add MigrationName --project FitSpark.Api

# Update database
dotnet ef database update --project FitSpark.Api
```

## Build System Configuration

### Vite Configuration

- **Root**: `client/` directory
- **Build Output**: `FitSpark.Api/wwwroot/` (unified deployment)
- **Dev Server**: Proxies `/api` requests to `http://localhost:5155`
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

### TypeScript Configuration

- **Module**: ESNext with bundler resolution
- **Target**: ESNext with DOM libraries
- **Strict Mode**: Enabled
- **Path Mapping**: Supports @ and @shared aliases
- **Include**: client/src, shared, server directories

### Package Scripts

```bash
npm run dev              # Vite dev server with API proxy
npm run build           # Build client to API wwwroot
npm run build:api       # Build .NET API only
npm run build:all       # Build both client and API
npm run build:production # Production build
npm run start:api       # Run unified application
npm run clean           # Clean build outputs
npm run restore         # Restore all dependencies
npm run check           # TypeScript type checking
```

## Build & Deployment

```bash
# Start full application (recommended)
dotnet run --project FitSpark.Api/FitSpark.Api.csproj

# Client-only development with hot reload
npm run dev  # Proxies to API at localhost:5155
```

### Build Commands

```bash
npm run build:client    # Builds React app to FitSpark.Api/wwwroot
npm run build:api       # Builds .NET API
npm run build:all       # Builds both client and API
npm run start:api       # Builds and runs unified application
```

### Production Deployment

```bash
npm run build:production
dotnet run --project FitSpark.Api/FitSpark.Api.csproj --configuration Release
```

## Component Guidelines

### UI Component Creation

- Use shadcn/ui components (New York style) as base when possible
- Follow the established component patterns in `@/components/ui/`
- Implement proper TypeScript interfaces
- Use Radix UI primitives for complex interactions
- Apply consistent styling with Tailwind CSS and CSS variables
- Use path aliases (@/) for clean imports
- Leverage Lucide React icons for consistency

### Form Handling

- Use React Hook Form with Zod validation
- Follow established patterns in Login/Register components
- Implement proper error handling and user feedback
- Validate both client-side and server-side

### State Management

- Use TanStack Query for all API data
- Implement proper loading and error states
- Use optimistic updates where appropriate
- Follow established query key patterns

## Security Considerations

### Authentication

- Use BCrypt for password hashing (backend)
- Implement proper session management
- Validate user permissions on both client and server
- Follow established authentication patterns in AuthContext

### API Security

- Validate all inputs on the server
- Use proper HTTP status codes
- Implement authorization checks
- Sanitize user inputs

## Theme System

The application supports dynamic theming with three modes:

- **Fun**: Bright, energetic colors
- **Aggressive**: Bold, intense colors
- **Drill**: Military-inspired, disciplined colors

### Theme Implementation

- Use CSS custom properties defined in `lib/themes.ts`
- Apply theme classes through ThemeContext
- Maintain theme persistence in localStorage
- Convert between API format ("Fun") and client format ("fun")

## File Naming Conventions

### Frontend

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `apiService.ts`)
- Types: camelCase (e.g., `api.ts`, `client.ts`)

### Backend

- Controllers: PascalCase with "Controller" suffix
- Services: PascalCase with service type suffix
- Models: PascalCase entity names
- DTOs: PascalCase with "Dto" suffix

## Testing Considerations

- Write unit tests for utility functions
- Test API endpoints with proper mocking
- Test React components with React Testing Library
- Validate form handling and validation logic
- Test authentication flows and protected routes

## Documentation Rules

### Code Documentation

- Document complex business logic
- Use JSDoc for TypeScript functions
- Use XML documentation for C# methods
- Document API endpoints with Swagger attributes

### Documentation Organization

- All documentation files (except README.md) are organized in the `/copilot` folder
- Keep instructions and integration summaries easily discoverable
- Follow consistent markdown formatting and structure

## Common Patterns to Follow

### Error Handling

```typescript
// Frontend
try {
  const result = await apiService.method();
  // Handle success
} catch (error) {
  console.error("Operation failed:", error);
  // Show user-friendly error message
}
```

```csharp
// Backend
try
{
    var result = await _service.MethodAsync();
    return Ok(result);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Operation failed");
    return BadRequest("Operation failed");
}
```

### Data Fetching

```typescript
// Use TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ["entity", id],
  queryFn: () => apiService.getEntity(id),
});
```

### Form Validation

```typescript
// Use Zod schemas
const schema = z.object({
  field: z.string().min(1, "Field is required"),
});

const form = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### Import Aliases

```typescript
// Use configured path aliases for clean imports
import { Button } from "@/components/ui/button";
import { ApiService } from "@/lib/apiService";
import { UserType } from "@/types/api";
import { SharedComponent } from "@shared/components";
```

## Performance Considerations

- Use React.memo for expensive components
- Implement proper query caching with TanStack Query
- Optimize database queries with proper indexing
- Use proper pagination for large datasets
- Minimize bundle size with tree shaking

## Deployment Architecture

The application uses a unified deployment model:

- React app builds to `FitSpark.Api/wwwroot`
- .NET API serves both API endpoints and static files
- Single origin eliminates CORS complexity
- SPA routing handled by fallback to index.html
- Production and development use same architecture

This comprehensive guide should help GitHub Copilot understand the project structure, coding patterns, and best practices to provide relevant and accurate code suggestions.
