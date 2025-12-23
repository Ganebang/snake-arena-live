# Contributing to Snake Arena Live

Thank you for your interest in contributing to Snake Arena Live! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- **Python 3.12+** with [uv](https://github.com/astral-sh/uv) package manager
- **Node.js 20+** with npm
- **Docker** (optional, for containerized development)
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/snake-arena-live.git
   cd snake-arena-live
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/snake-arena-live.git
   ```

### Local Setup

```bash
# Install all dependencies
make install

# Or install individually
make install-backend   # Backend only
make install-frontend  # Frontend only
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 2. Make Your Changes

#### Backend Development

```bash
# Start backend dev server
make dev-backend

# Run tests frequently
make test-backend

# Lint and format
make lint-backend
make format-backend
```

**Backend Guidelines:**
- Follow Python [PEP 8](https://peps.python.org/pep-0008/) style guide
- Use type hints for all function signatures
- Write docstrings for public functions and classes
- Keep functions small and focused
- Use Pydantic models for validation

#### Frontend Development

```bash
# Start frontend dev server
make dev-frontend

# Run tests
make test-frontend

# Lint
make lint-frontend
```

**Frontend Guidelines:**
- Use TypeScript strictly (no `any` types without justification)
- Follow React best practices (hooks, functional components)
- Use Tailwind CSS for styling
- Keep components small and reusable
- Write accessible HTML (use semantic elements, ARIA labels)

### 3. Write Tests

All new features and bug fixes must include tests.

**Backend Testing:**
```bash
cd backend

# Unit tests go in tests/
# Integration tests go in integration_tests/

uv run pytest tests/               # Run unit tests
uv run pytest integration_tests/   # Run integration tests
uv run pytest                      # Run all tests
```

**Frontend Testing:**
```bash
cd frontend

# Tests go in src/tests/ or co-located with components
npm test                # Run all tests
npm run test:ui         # Run with UI
```

**Test Coverage:**
- Aim for 80%+ code coverage on new code
- All critical paths must be tested
- Include edge cases and error scenarios

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user profile page

- Add ProfilePage component
- Add API endpoint for user profile
- Add tests for profile functionality"
```

**Commit Message Format:**
```
<type>: <short description>

<optional longer description>
<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Keep Your Branch Updated

Regularly sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

## Coding Standards

### Python (Backend)

- **Style**: PEP 8
- **Formatter**: Ruff (configured in `pyproject.toml`)
- **Linter**: Ruff
- **Type Checker**: MyPy (when added)
- **Line Length**: 100 characters
- **Imports**: Sorted alphabetically, grouped by stdlib/third-party/local

Example:
```python
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..core.config import settings
from ..db.session import get_db
from ..schemas.user import User, UserCreate


def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> User:
    """Create a new user in the database.
    
    Args:
        user_data: User creation data with email and password
        db: Database session
        
    Returns:
        Created user object
        
    Raises:
        HTTPException: If user already exists
    """
    # Implementation...
```

### TypeScript/React (Frontend)

- **Style**: ESLint configuration
- **Formatter**: Prettier (via ESLint)
- **Line Length**: 100 characters
- **Components**: Functional components with hooks

Example:
```typescript
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Implementation...
  
  return (
    <div className="profile-container">
      {/* JSX */}
    </div>
  );
}
```

## Testing Requirements

### Backend Tests

1. **Unit Tests** (`tests/`)
   - Test individual functions and classes
   - Mock external dependencies
   - Fast execution

2. **Integration Tests** (`integration_tests/`)
   - Test API endpoints
   - Use test database (SQLite in-memory)
   - Test full request/response cycle

3. **Coverage**
   ```bash
   uv run pytest --cov=src --cov-report=html
   # Open htmlcov/index.html to view coverage
   ```

### Frontend Tests

1. **Component Tests**
   - Test rendering
   - Test user interactions
   - Test state changes

2. **Integration Tests**
   - Test component integration
   - Mock API calls

Example:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

test('displays user name', async () => {
  render(<UserProfile userId="123" />);
  
  const userName = await screen.findByText(/John Doe/i);
  expect(userName).toBeInTheDocument();
});
```

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`make test`)
- [ ] Code is formatted (`make format`)
- [ ] Code is linted (`make lint`)
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear
- [ ] Branch is up to date with main

### Submitting

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes were made and why
   - **Related Issues**: Link any related issues
   - **Testing**: Describe how you tested the changes
   - **Screenshots**: Include for UI changes

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

### After Merging

- Delete your feature branch
- Update your local main branch:
  ```bash
  git checkout main
  git pull upstream main
  ```

## Issue Reporting

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, versions
- **Screenshots**: If applicable

### Feature Requests

Include:
- **Description**: What feature you'd like
- **Use Case**: Why it's needed
- **Proposed Solution**: How it might work
- **Alternatives**: Other approaches considered

## Questions?

- Open an issue for questions
- Tag with `question` label
- Be specific about what you need help with

## Thank You!

Your contributions make Snake Arena Live better for everyone. Thank you for taking the time to contribute! 🎉
