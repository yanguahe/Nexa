---
summary: "CLI reference for `nexa reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `nexa reset`

Reset local config/state (keeps the CLI installed).

```bash
nexa reset
nexa reset --dry-run
nexa reset --scope config+creds+sessions --yes --non-interactive
```
