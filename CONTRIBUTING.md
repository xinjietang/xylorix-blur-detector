# Contributing to Xylorix Blur Detector

Thank you for your interest in contributing to Xylorix Blur Detector! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/xylorix-blur-detector.git
   cd xylorix-blur-detector
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/xinjietang/xylorix-blur-detector.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   cd ios && pod install && cd ..
   ```
5. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Process

### Before You Start

- Check existing issues to see if someone is already working on it
- Open an issue to discuss major changes before implementing
- Make sure you understand the project architecture

### Development Workflow

1. **Make changes** in your feature branch
2. **Test thoroughly** on both iOS and Android
3. **Follow coding standards** (see below)
4. **Update documentation** if needed
5. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add new blur algorithm"
   git commit -m "fix: resolve iOS memory leak"
   git commit -m "docs: update setup instructions"
   ```

### Commit Message Format

Use conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Pull Request Process

1. **Update your branch** with latest upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request** on GitHub:
   - Provide clear title and description
   - Reference related issues
   - Include screenshots for UI changes
   - List what you tested

4. **Address review feedback**:
   - Respond to comments
   - Make requested changes
   - Push updates to the same branch

5. **PR Requirements**:
   - All tests must pass
   - Code must be linted
   - Documentation must be updated
   - No merge conflicts

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use strict mode settings

```typescript
// Good
interface BlurResult {
  score: number;
  status: BlurStatus;
}

// Bad
const result: any = getBlurScore();
```

### React/React Native

- Use functional components with hooks
- Follow React best practices
- Use meaningful component names
- Extract reusable logic into custom hooks

```typescript
// Good
const useBlurDetection = (config: BlurConfig) => {
  const [metrics, setMetrics] = useState<BlurMetrics | null>(null);
  // ...
};

// Use in component
const MyComponent = () => {
  const { metrics } = useBlurDetection(config);
  // ...
};
```

### Native Code

**iOS (Swift)**:
- Follow Swift style guide
- Use proper memory management (autoreleasepool)
- Document complex algorithms
- Use Accelerate framework for performance

**Android (Kotlin)**:
- Follow Kotlin coding conventions
- Use coroutines for async operations
- Proper null safety
- Optimize for battery and memory

### Code Organization

- Keep files focused and single-purpose
- Group related functionality
- Use clear, descriptive names
- Avoid deep nesting

### Comments and Documentation

- Comment complex algorithms
- Explain "why" not "what"
- Keep comments up to date
- Use JSDoc for public APIs

```typescript
/**
 * Calculate blur score using FFT algorithm
 * @param image - Input image data
 * @returns Score between 0-1 where lower = more blur
 */
function calculateFFTBlur(image: ImageData): number {
  // Implementation
}
```

## Testing Guidelines

### Manual Testing

Before submitting PR, test:
1. **iOS**: Test on simulator and real device if possible
2. **Android**: Test on emulator and real device if possible
3. **Different devices**: Test on various screen sizes
4. **Performance**: Monitor FPS and memory usage
5. **Edge cases**: Test with poor lighting, extreme blur, etc.

### Test Checklist

- [ ] Camera permissions work correctly
- [ ] Blur detection produces reasonable scores
- [ ] UI is responsive and smooth
- [ ] No memory leaks during extended use
- [ ] App doesn't crash on orientation changes
- [ ] Settings are persisted correctly
- [ ] Error states are handled gracefully

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Fix bugs that affect usage
- Improve performance significantly

### Documentation Files

- **README.md**: Overview, features, basic usage
- **SETUP.md**: Detailed setup instructions
- **CONTRIBUTING.md**: This file
- **Code comments**: Algorithm explanations, complex logic

### Documentation Style

- Clear and concise
- Include code examples
- Use proper formatting (markdown)
- Test all code examples

## Types of Contributions

We welcome various types of contributions:

### Bug Fixes
- Fix crashes, memory leaks, or incorrect behavior
- Improve error handling
- Fix platform-specific issues

### Features
- New blur detection algorithms
- UI improvements
- Performance optimizations
- Configuration options

### Documentation
- Improve existing docs
- Add examples
- Fix typos
- Translate to other languages

### Performance
- Optimize algorithms
- Reduce memory usage
- Improve FPS
- Battery optimization

### Testing
- Add test cases
- Improve test coverage
- Add integration tests

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Check existing documentation first

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the repository

Thank you for contributing to Xylorix Blur Detector! 🎉
