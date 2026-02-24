---
summary: "CLI reference for `nexa logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `nexa logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
nexa logs
nexa logs --follow
nexa logs --json
nexa logs --limit 500
nexa logs --local-time
nexa logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
