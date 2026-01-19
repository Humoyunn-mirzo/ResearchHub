# Contributing to ResearchHub Frontend

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/researchhub.git
   cd researchhub/frontend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start Development**
   ```bash
   pnpm dev
   ```

## 📝 Code Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No `any` types**: Use proper typing
- **No `@ts-ignore`**: Fix type issues properly
- **Interfaces vs Types**: Use `type` for consistency

### Components

#### File Structure
```typescript
// ✅ Good - One component per file
export function ProjectCard({ project }: ProjectCardProps) {
  return <Card>...</Card>
}

// ❌ Bad - Multiple components in one file
export function ProjectCard() { ... }
export function ProjectList() { ... }
```

#### Component Size
- **Maximum 150 lines** per component
- Break large components into smaller ones
- Extract logic into custom hooks

#### Naming
```typescript
// ✅ Good
function ProjectCard() { ... }           // PascalCase for components
function useProjects() { ... }           // camelCase with 'use' prefix for hooks
type ProjectCardProps = { ... }          // PascalCase for types

// ❌ Bad
function projectCard() { ... }
function Projects() { ... }              // Too generic
type projectCardProps = { ... }
```

### React Best Practices

#### Server Components First
```typescript
// ✅ Good - Server Component by default
export default async function ProjectsPage() {
  const projects = await fetchProjects()
  return <ProjectsList projects={projects} />
}

// Only use 'use client' when necessary
'use client'
export function InteractiveComponent() { ... }
```

#### Props Destructuring
```typescript
// ✅ Good
function ProjectCard({ project, onApply }: ProjectCardProps) {
  return <Card>...</Card>
}

// ❌ Bad
function ProjectCard(props: ProjectCardProps) {
  return <Card>{props.project.title}</Card>
}
```

### Business Logic Separation

```typescript
// ✅ Good - Logic in service layer
// core/services/project.service.ts
export async function fetchProjects(filters: ProjectFilters) {
  const response = await apiClient.get('/projects', { params: filters })
  return ProjectsResponseSchema.parse(response.data)
}

// Component uses service
function ProjectsList() {
  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  })
  return <div>...</div>
}

// ❌ Bad - Logic in component
function ProjectsList() {
  const [projects, setProjects] = useState([])
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data))
  }, [])
  return <div>...</div>
}
```

## 🎨 Styling Guidelines

### Tailwind Classes
```typescript
// ✅ Good - Organized classes
<div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-6">

// ❌ Bad - Random order
<div className="p-6 border gap-4 items-center rounded-lg flex bg-card justify-between">
```

### Component Variants (CVA)
```typescript
// ✅ Good - Use CVA for variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
      },
    },
  }
)
```

## 🧪 Testing

### Unit Tests
```typescript
// ✅ Good - Test business logic
import { describe, it, expect } from 'vitest'
import { hasPermission } from '@/core/policies'

describe('hasPermission', () => {
  it('should allow students to apply to projects', () => {
    expect(hasPermission('STUDENT', Permission.APPLY_TO_PROJECT)).toBe(true)
  })
})
```

### E2E Tests
```typescript
// ✅ Good - Test user flows
import { test, expect } from '@playwright/test'

test('student can apply to project', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'student@test.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await page.goto('/projects/1')
  await page.click('text=Apply to This Project')
  await expect(page.locator('text=Application submitted')).toBeVisible()
})
```

## 📦 Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add project filtering by tags
fix: resolve authentication token expiry issue
docs: update API integration guide
style: format code with prettier
refactor: extract project card component
test: add unit tests for permission system
chore: update dependencies
```

### Branch Naming

```
feature/project-filtering
fix/auth-token-expiry
docs/api-integration
refactor/project-card-component
```

### Pull Request Process

1. **Update from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run checks**
   ```bash
   pnpm type-check
   pnpm lint
   pnpm test
   ```

3. **Create PR**
   - Use descriptive title
   - Reference related issues
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

## 🔍 Code Review Guidelines

### For Reviewers

✅ **Check:**
- Code follows project standards
- No unnecessary complexity
- Proper error handling
- Tests included
- Documentation updated

❌ **Avoid:**
- Nitpicking formatting (use Prettier)
- Blocking on personal preferences
- Requesting unnecessary abstractions

### For Contributors

- **Respond promptly** to review comments
- **Explain reasoning** for architectural decisions
- **Be open** to feedback and suggestions
- **Update PR** based on feedback

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version

### Feature Requests

Include:
- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Alternative solutions considered
- **Additional Context**: Any other relevant information

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 💬 Getting Help

- **Discord**: [Join our Discord](https://discord.gg/researchhub)
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/researchhub/discussions)
- **Email**: dev@researchhub.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Happy Contributing! 🎉**
