# Contributing to Prometheus 3.0

Thank you for your interest in contributing! We welcome contributions from the community.

---

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How to Contribute

### 1. Reporting Bugs

- Open a [GitHub Issue](https://github.com/your-org/Prometheus_IA_Dev_Marketplace/issues) with a clear title and description.
- Include steps to reproduce, expected vs. actual behavior, and environment details (OS, browser, versions).
- Add relevant labels (e.g., `bug`, `frontend`, `backend`).

### 2. Suggesting Features

- Open a Feature Request issue with the label `enhancement`.
- Describe the problem and the proposed solution clearly.
- Explain why this would benefit the project.

### 3. Submitting Pull Requests

1. **Fork** the repository and create your branch from `main`.
2. **Branch naming**: `feature/your-feature-name`, `fix/your-fix-name`, `chore/your-chore-name`.
3. **Commit messages**: Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
4. **Run checks**: Ensure linting, type-checking, and tests pass before submitting.
5. **Open a PR** against `main` with a clear title and description. Reference any related issues.

#### PR Checklist

- [ ] Code follows the project's style and conventions.
- [ ] Linting passes (`npm run lint` / `pnpm lint`).
- [ ] Type-checking passes (`npm run typecheck` / `pnpm typecheck`).
- [ ] Tests pass and new tests are added for new functionality.
- [ ] Documentation is updated if public APIs or behavior changed.
- [ ] No new warnings or errors are introduced.

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/Prometheus_IA_Dev_Marketplace.git
cd Prometheus_IA_Dev_Marketplace

# Install dependencies
npm install   # or pnpm install

# Start a specific product (e.g., AgentForge)
cd apps/agent-forge
npm run dev
```

Refer to each product's `README.md` for product-specific instructions.

---

## Code Style

- **JavaScript/TypeScript**: Prettier + ESLint (config at root level).
- **Python**: Ruff + Black (config in `pyproject.toml` where applicable).
- **Go**: `gofmt` standard formatting.
- **Commits**: Conventional Commits (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`).

---

## Questions?

Open a [Discussion](https://github.com/your-org/Prometheus_IA_Dev_Marketplace/discussions) or reach out to the maintainers. We're happy to help you get started.
