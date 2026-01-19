# ResearchHub Frontend

> **Production-ready Research Collaboration Platform** built with Next.js 15, React 19, TypeScript, and following SOLID principles and Clean Architecture patterns.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

ResearchHub is a comprehensive platform connecting students, professors, and administrators across universities for collaborative research opportunities. Built with modern web technologies and enterprise-grade architecture.

## ✨ Key Features

- 🔐 **Role-Based Access Control (RBAC)** - 4 user roles with granular permissions
- 🎨 **Modern UI** - Built with Tailwind CSS, CVA, and ShadCN components
- 🚀 **Server Components** - RSC-first architecture for optimal performance
- 📱 **Fully Responsive** - Mobile-first design approach
- 🔒 **Security First** - CSP headers, XSS protection, secure token management
- 🧪 **Comprehensive Testing** - Unit tests (Vitest), E2E tests (Playwright)
- 📦 **Type-Safe** - TypeScript strict mode with Zod validation
- ⚡ **Optimized Performance** - Edge middleware, partial prerendering

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Runtime:** React 19
- **Language:** TypeScript 5.6 (strict mode)
- **Styling:** Tailwind CSS + CVA
- **State Management:** Zustand + TanStack Query
- **Validation:** Zod
- **HTTP Client:** Axios
- **Testing:** Vitest + Playwright
- **Code Quality:** ESLint + Prettier + Husky

### Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── (public)/            # Public routes (homepage, projects)
│   ├── (auth)/              # Authentication routes
│   ├── dashboard/           # Protected dashboard routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
│
├── components/
│   ├── ui/                  # Reusable UI primitives (Button, Input, Card)
│   ├── layout/              # Layout components (Header, Footer)
│   └── shared/              # Feature-specific shared components
│
├── core/
│   ├── domain/              # Domain models, entities, Zod schemas
│   ├── services/            # API service layer (SRP)
│   └── policies/            # Authorization policies, RBAC
│
├── lib/
│   ├── api/                 # API client configuration
│   ├── auth/                # Authentication utilities
│   ├── utils.ts             # Utility functions
│   └── env.ts               # Environment validation
│
├── middleware.ts            # Next.js middleware (auth, RBAC)
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

### Design Principles

✅ **SOLID Principles**
- **S**ingle Responsibility: Each component/service has one job
- **O**pen/Closed: Extensible without modification
- **L**iskov Substitution: Proper inheritance hierarchies
- **I**nterface Segregation: Focused interfaces
- **D**ependency Inversion: Depend on abstractions

✅ **Clean Architecture**
- Domain layer (entities, value objects)
- Application layer (use cases, services)
- Infrastructure layer (API, storage)
- Presentation layer (UI components)

✅ **Code Quality Standards**
- Components ≤ 150 LOC
- No business logic in UI
- Pure functions for testability
- Consistent naming conventions

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 9.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/researchhub.git
   cd researchhub/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NODE_ENV=development
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Testing
pnpm test             # Run unit tests
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Generate coverage report
pnpm e2e              # Run E2E tests
pnpm e2e:ui           # Run E2E tests with UI
```

## 👥 User Roles

### 1. Student
- Browse and search projects
- Apply to open projects
- Track application status
- View personal dashboard

### 2. Professor
- Create and manage research projects
- Review student applications
- Accept/reject applicants
- Close projects

### 3. University Admin
- Moderate content within university
- Manage university users
- View analytics

### 4. Platform Admin
- Full system access
- Global content moderation
- User management across all universities
- Platform analytics

## 🔒 Security

- **Authentication:** JWT-based with refresh tokens
- **Authorization:** RBAC at middleware + component level
- **XSS Protection:** Content Security Policy headers
- **CSRF:** SameSite cookies
- **Input Validation:** Zod schemas on all inputs
- **API Security:** Token in Authorization header
- **Error Handling:** User-safe error messages

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
pnpm test
```
- Domain logic (pure functions)
- Utility functions
- Component logic (non-UI)

### E2E Tests (Playwright)
```bash
pnpm e2e
```
- Critical user flows
- Authentication flows
- Role-based access
- Project creation/application

## 📝 API Integration

The frontend consumes a REST API provided by the backend team. All API calls go through:

1. **Service Layer** (`core/services/`)
   - Handles HTTP requests
   - Validates responses with Zod
   - Returns typed data

2. **API Client** (`lib/api/client.ts`)
   - Axios wrapper
   - Token management
   - Error normalization
   - Request/response interceptors

3. **TanStack Query**
   - Server state management
   - Caching
   - Background refetching
   - Optimistic updates

### Example Service

```typescript
// core/services/project.service.ts
export async function fetchProjects(filters: ProjectFilters) {
  const response = await apiClient.get('/projects', { params: filters })
  return ProjectsResponseSchema.parse(response.data)
}
```

## 🎨 UI Components

Built with **ShadCN** principles - headless, accessible, customizable:

- ✅ Fully typed with TypeScript
- ✅ Accessible (ARIA attributes)
- ✅ Variant-based with CVA
- ✅ Themeable with CSS variables
- ✅ Dark mode ready

## 🔄 State Management

### Client State (Zustand)
- Authentication state
- User preferences
- UI state

### Server State (TanStack Query)
- API data caching
- Background refetching
- Optimistic updates
- Error/loading states

## 📦 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

Required for production:
```env
NEXT_PUBLIC_API_URL=https://api.researchhub.com
NODE_ENV=production
```

### Recommended Hosting
- **Vercel** (optimal for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (self-hosted)

## 🛠️ Development Guidelines

### Component Development

1. **Create UI primitives first** (`components/ui/`)
2. **Build shared components** (`components/shared/`)
3. **Compose pages** (`app/`)

### Service Development

1. Define Zod schemas in `core/domain/`
2. Create service function in `core/services/`
3. Add React Query hook if needed

### Naming Conventions

- **Components:** PascalCase (e.g., `ProjectCard.tsx`)
- **Functions:** camelCase (e.g., `fetchProjects`)
- **Types:** PascalCase (e.g., `Project`, `User`)
- **Files:** kebab-case for non-components

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] ESLint no errors
- [ ] Prettier formatted
- [ ] Tests pass
- [ ] Components ≤ 150 LOC
- [ ] No console.logs
- [ ] Proper error handling

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 📞 Support

- **Documentation:** [docs.researchhub.com](https://docs.researchhub.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/researchhub/issues)
- **Email:** support@researchhub.com

---

**Built with ❤️ by the ResearchHub Team**

