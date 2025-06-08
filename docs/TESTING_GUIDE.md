# Testing Guide

## Overview

This project uses Vitest as the testing framework with React Testing Library for component testing. The testing strategy focuses on unit tests, integration tests, and comprehensive coverage.

## Running Tests

### Basic Commands
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Types

#### Unit Tests
Located in `src/test/` directory, these test individual functions and components in isolation.

**Utility Functions**: `src/test/utils/dashboardUtils.test.ts`
- Tests calculation functions
- Validates string manipulation
- Checks CSS class generation
- Tests edge cases and error conditions

**Hooks**: `src/test/hooks/useDashboardData.test.ts`
- Tests data initialization
- Validates state management
- Checks setter function availability

**Components**: `src/test/components/`
- Tests component rendering
- Validates prop handling
- Checks user interactions
- Tests accessibility features

#### Integration Tests
Test how components work together:

**Dashboard Integration**: `src/test/components/Dashboard.integration.test.tsx`
- Tests complete dashboard rendering
- Validates data flow between components
- Checks navigation functionality
- Tests overall user experience

## Writing Tests

### Component Testing Example
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskOverviewCard from '../components/dashboard/TaskOverviewCard';

describe('TaskOverviewCard', () => {
  const mockStats = {
    tasksCompleted: 30,
    tasksInProgress: 15,
    tasksNotStarted: 10,
    totalTasks: 55,
    overdueTasks: 3
  };

  it('should render with correct data', () => {
    render(<TaskOverviewCard stats={mockStats} />);
    
    expect(screen.getByTestId('task-overview-card')).toBeInTheDocument();
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('55%');
  });
});
```

### Utility Function Testing Example
```typescript
import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage } from '../utils/dashboardUtils';

describe('calculateCompletionPercentage', () => {
  it('should calculate correct percentage', () => {
    const stats = {
      tasksCompleted: 30,
      totalTasks: 50,
      // ... other properties
    };
    expect(calculateCompletionPercentage(stats)).toBe(60);
  });
});
```

## Testing Guidelines

### What to Test
- **Component Rendering**: Ensure components render without errors
- **Props Handling**: Test that props are properly used and displayed
- **User Interactions**: Test clicks, hovers, and other user actions
- **Edge Cases**: Test with empty data, zero values, and error conditions
- **Accessibility**: Test ARIA labels and keyboard navigation
- **Data Transformations**: Test calculations and data formatting

### What Not to Test
- **Implementation Details**: Don't test internal component state unless it affects output
- **Third-party Libraries**: Don't test React Router or other external libraries
- **Styling Details**: Don't test specific CSS values unless they're critical to functionality

### Best Practices

#### Use Data Test IDs
Add `data-testid` attributes to elements you need to test:
```jsx
<div data-testid="task-overview-card">
  <span data-testid="completion-percentage">{percentage}%</span>
</div>
```

#### Descriptive Test Names
Use clear, descriptive test names that explain what is being tested:
```typescript
// Good
it('should display overdue status when collaborator has overdue tasks', () => {});

// Bad
it('should show status', () => {});
```

#### Test User Behavior
Focus on testing what users see and do:
```typescript
// Good
expect(screen.getByText('John Doe')).toBeInTheDocument();

// Bad
expect(component.state.collaborators[0].name).toBe('John Doe');
```

#### Use Proper Assertions
Choose the right assertion for each test:
```typescript
// For existence
expect(element).toBeInTheDocument();

// For text content
expect(element).toHaveTextContent('Expected Text');

// For attributes
expect(element).toHaveAttribute('href', '/expected-path');

// For styling
expect(element).toHaveStyle({ width: '50%' });
```

## Test Organization

### File Structure
```
src/test/
├── setup.ts                      # Test configuration
├── components/                   # Component tests
│   ├── TaskOverviewCard.test.tsx
│   ├── TeamOverviewCard.test.tsx
│   └── Dashboard.integration.test.tsx
├── hooks/                        # Hook tests
│   └── useDashboardData.test.ts
└── utils/                        # Utility function tests
    └── dashboardUtils.test.ts
```

### Naming Conventions
- Test files: `ComponentName.test.tsx` or `functionName.test.ts`
- Integration tests: `ComponentName.integration.test.tsx`
- Test suites: Use `describe` blocks for logical grouping
- Test cases: Use descriptive `it` statements

## Mocking

### Component Mocking
Mock components that aren't part of the current test:
```typescript
vi.mock('../components/WeeklyCalendarWidget', () => ({
  default: () => <div data-testid="weekly-calendar-widget">Weekly Calendar</div>
}));
```

### Router Mocking
Wrap components that use React Router:
```typescript
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

render(
  <RouterWrapper>
    <ComponentUnderTest />
  </RouterWrapper>
);
```

## Coverage Guidelines

### Target Coverage
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Coverage Reports
View coverage reports in:
- Terminal output after running `npm run test:coverage`
- HTML report in `coverage/` directory
- VS Code with coverage extensions

### Improving Coverage
1. **Identify uncovered code** using coverage reports
2. **Add tests for missing scenarios**
3. **Remove dead code** if coverage reveals unused functions
4. **Test error conditions** and edge cases

## Debugging Tests

### Common Issues
1. **Component not rendering**: Check if all required props are provided
2. **Element not found**: Verify data-testid attributes and component structure
3. **Async issues**: Use proper async/await patterns
4. **Router errors**: Ensure components are wrapped with RouterWrapper

### Debugging Tools
```typescript
// Debug component output
render(<Component />);
screen.debug(); // Prints current DOM

// Debug specific element
const element = screen.getByTestId('test-id');
console.log(element.innerHTML);

// Check what queries are available
screen.getByRole('button'); // Shows available buttons
```

## Continuous Integration

### Pre-commit Hooks
Consider adding pre-commit hooks to run tests:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run && npm run lint"
    }
  }
}
```

### CI Pipeline
Example GitHub Actions workflow:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
```

## Performance Testing

### Considerations
- Test component render times for large datasets
- Monitor memory usage during tests
- Check for memory leaks in long-running test suites

### Tools
- Use React DevTools Profiler for performance analysis
- Monitor test execution times
- Use `console.time()` for custom performance measurements

This testing strategy ensures high-quality, maintainable code with comprehensive coverage and clear debugging paths.
