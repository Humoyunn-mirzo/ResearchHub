# Architecture Documentation

## Overview

ResearchHub frontend follows **Clean Architecture** principles with a feature-first modular structure. The architecture is designed for scalability, maintainability, and testability.

## Layers

### 1. Domain Layer (`core/domain/`)
- **Entities**: Core business objects (User, Project, Application)
- **Value Objects**: Immutable objects representing concepts
- **Schemas**: Zod validation schemas
- **Errors**: Domain-specific error classes

**Rules:**
- No dependencies on other layers
- Pure TypeScript/JavaScript
- Framework-agnostic

### 2. Application Layer (`core/services/`, `core/policies/`)
- **Services**: Business logic, use cases
- **Policies**: Authorization rules, RBAC
- **Repositories**: Data access abstractions (future)

**Rules:**
- Depends only on domain layer
- Orchestrates domain objects
- No UI knowledge

### 3. Infrastructure Layer (`lib/`)
- **API Client**: HTTP communication
- **Authentication**: Token management
- **Utilities**: Helper functions

**Rules:**
- Implements abstractions from application layer
- External service integration

### 4. Presentation Layer (`app/`, `components/`)
- **Pages**: Route-based UI
- **Components**: Reusable UI elements
- **Layouts**: Page structures

**Rules:**
- Depends on all other layers
- No business logic
- Focus on user interaction

## Data Flow

```
User Action → Component → Service → API Client → Backend
                ↓
            State Update (TanStack Query / Zustand)
                ↓
            Component Re-render
```

## Component Architecture

### Atomic Design

```
Atoms (ui/button, ui/input)
  ↓
Molecules (shared/project-card)
  ↓
Organisms (shared/projects-list)
  ↓
Templates (layout/header, layout/footer)
  ↓
Pages (app/)
```

### Component Types

1. **Server Components (RSC)** - Default
   - Static rendering
   - No client-side JavaScript
   - Direct data fetching

2. **Client Components** - When needed
   - Interactive features
   - Browser APIs
   - Event handlers
   - State management

## State Management Strategy

### Server State (TanStack Query)
- API data
- Caching strategy
- Background refetching
- Optimistic updates

### Client State (Zustand)
- Authentication
- User preferences
- Ephemeral UI state

### URL State (Next.js Router)
- Filters
- Pagination
- Search queries

### Locale (`lib/i18n`)
The active language lives in a `locale` cookie rather than client storage.
`app/layout.tsx` reads it on the server, stamps `<html lang>`, and seeds
`I18nProvider`, so server markup and the first client render always agree — no
hydration mismatch and no flash of the wrong language. `useTranslation()`
returns `t(key, values)`; `en.ts` is the source of truth and every other locale
is typed as `Record<MessageKey, string>`, so a missing key is a compile error.

Reading the cookie in the root layout makes every route server-rendered on
demand. That is the deliberate trade for correct server-side language; the
alternative is locale-prefixed routes (`/uz/...`).

## Security Architecture

### Frontend Security Layers

1. **Middleware** - Route protection
2. **Component Guards** - Conditional rendering
3. **API Client** - Token management
4. **CSP Headers** - XSS prevention

### RBAC Implementation

```typescript
Permission Check → Policy Evaluation → UI Update
```

## Performance Optimization

1. **Server Components** - Reduce client bundle
2. **Code Splitting** - Route-based chunks
3. **Image Optimization** - Next.js Image
4. **Caching** - TanStack Query
5. **Edge Middleware** - Fast auth checks

## Testing Strategy

### Unit Tests
- Domain logic
- Utility functions
- Pure components

### Integration Tests
- Service layer
- API integration
- State management

### E2E Tests
- Critical user flows
- Multi-step processes
- Cross-role interactions

## Error Handling

### Error Flow

```
API Error → Service Layer → Normalized DomainError → Component → User Message
```

### Error Types

1. **Domain Errors** - Business logic violations
2. **Network Errors** - Connection issues
3. **Validation Errors** - Input validation failures
4. **Authorization Errors** - Permission denied

## Build & Deployment

### Build Process

1. TypeScript compilation
2. Next.js optimization
3. Asset bundling
4. Static generation (where applicable)

### Deployment Options

- **Vercel** (Recommended)
- **Docker** (Self-hosted)
- **Netlify**
- **AWS Amplify**

## Future Considerations

1. **Micro-frontends** - If scaling to multiple teams
2. **GraphQL** - If API complexity grows
3. **WebSockets** - Real-time features
4. **PWA** - Offline capabilities
5. **Mobile App** - React Native with shared business logic
