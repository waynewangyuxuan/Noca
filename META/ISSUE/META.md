# META/ISSUE - Index

Development issues, design decisions, and problem records.

---

## Workflow

Issues must exist in **both** places:
1. **Local** - `META/ISSUE/{name}.md` for detailed context and decisions
2. **GitHub** - Create matching GitHub Issue for tracking and collaboration

When creating an issue:
1. Create local `.md` file with full details
2. Create GitHub Issue with summary and link to local file
3. Reference GitHub Issue number in local file

---

## Naming Convention

```
{Milestone}_{Summary}_{Date}.md
```

Examples:
- `M1_DatabaseConnectionTimeout_2026-01-06.md`
- `M2_APIRateLimitStrategy_2026-01-07.md`

---

## Issue Template

```markdown
# {Summary}

**GitHub Issue:** #{number}

## Context
What led to this issue.

## Problem
What's the problem or decision needed.

## Options
1. Option A - pros/cons
2. Option B - pros/cons

## Decision
What we decided and why.

## Resolution
How it was resolved (update after fixing).
```

---

## Issues

*No issues yet.*

<!--
Add issues as they arise:
| Issue | Status | Date |
|-------|--------|------|
| [M1_Example](M1_Example_2026-01-06.md) | Resolved | 2026-01-06 |
-->
