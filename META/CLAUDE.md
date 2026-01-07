# META - Documentation Index

Project documentation hub. Start here.

---

## Structure

```
META/
├── CLAUDE.md        ← You are here
├── PROGRESS.md      # Development log (append-only)
├── TODO.md          # Next iteration tasks (append-only)
├── CORE/            # What & How
├── ISSUE/           # Problem records
└── MILESTONES/      # Implementation phases
```

---

## Quick Links

### Core Documentation

| File | Description |
|------|-------------|
| [CORE/PRODUCT.md](CORE/PRODUCT.md) | Product definition: features, workflows, V1 scope |
| [CORE/REGULATION.md](CORE/REGULATION.md) | Development principles: atomic code, testing, documentation |
| [CORE/TECHNICAL.md](CORE/TECHNICAL.md) | Technical implementation: architecture, code, setup |

### Tracking

| File | Description |
|------|-------------|
| [PROGRESS.md](PROGRESS.md) | What we've done (append-only log) |
| [TODO.md](TODO.md) | What's next (append-only tasks) |

### Reference

| Folder | Description |
|--------|-------------|
| [ISSUE/](ISSUE/META.md) | Development issues, named `{Milestone}_{Summary}_{Date}` |
| [MILESTONES/](MILESTONES/META.md) | Implementation phases M1→M8 |

---

## Reading Order

1. **CORE/PRODUCT.md** - Understand what we're building
2. **CORE/REGULATION.md** - Understand how we work
3. **CORE/TECHNICAL.md** - Implementation details
4. **MILESTONES/** - Current development phase
5. **ISSUE/** - Known problems and decisions

---

## Development Workflow

### Before Coding

1. Read relevant CORE/ docs to understand context
2. Check current MILESTONE for scope
3. Review related ISSUEs if any

### During Development

1. Follow REGULATION.md principles (atomic code, testing, etc.)
2. One feature/fix per commit
3. If blocked by a design decision → create ISSUE file

### After Completing a Task

1. Update PROGRESS.md with what was done
2. Update TODO.md if new tasks discovered
3. If issue resolved → note resolution in ISSUE file

### Creating Documentation

| Type | Location | Naming |
|------|----------|--------|
| Issue | ISSUE/ | `{Milestone}_{Summary}_{Date}.md` |
| Progress | PROGRESS.md | Append with date header |
| TODO | TODO.md | Append with date header |

### Commit Message Format

```
{type}: {summary}

{body if needed}
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
