# Contributing Guide

## Branching

```
main              # production-ready
└── feat/{name}   # feature branches
└── fix/{name}    # bug fix branches
└── docs/{name}   # documentation changes
```

### Branch Naming

```
{type}/{short-description}
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

Examples:
- `feat/user-auth`
- `fix/login-timeout`
- `docs/api-reference`

---

## Commits

### Format

```
{type}: {summary}

{body - optional}
```

### Types

| Type | Use for |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding/fixing tests |
| `chore` | Build, config, dependencies |

### Examples

```
feat: add user authentication

fix: resolve login timeout on slow networks

docs: update API reference for v2 endpoints
```

### Rules

- Summary in imperative mood ("add" not "added")
- No period at end of summary
- Body explains "why", not "what"
- Reference issue number if applicable: `Fixes #123`

---

## Pull Requests

1. Create branch from `main`
2. Make changes with clear commits
3. Push and open PR
4. Fill in PR template
5. Request review
6. Squash merge when approved

### PR Title

Same format as commits:
```
{type}: {summary}
```

---

## Issues

Issues exist in **two places**:

1. **GitHub Issues** - For tracking and collaboration
2. **META/ISSUE/** - For detailed context and decisions

### Creating an Issue

1. Open GitHub Issue with summary
2. Create `META/ISSUE/{Milestone}_{Summary}_{Date}.md` with full details
3. Link them together

See [META/ISSUE/META.md](../META/ISSUE/META.md) for template.
