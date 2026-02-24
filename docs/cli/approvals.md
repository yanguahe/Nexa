---
summary: "CLI reference for `nexa approvals` (exec approvals for gateway or node hosts)"
read_when:
  - You want to edit exec approvals from the CLI
  - You need to manage allowlists on gateway or node hosts
title: "approvals"
---

# `nexa approvals`

Manage exec approvals for the **local host**, **gateway host**, or a **node host**.
By default, commands target the local approvals file on disk. Use `--gateway` to target the gateway, or `--node` to target a specific node.

Related:

- Exec approvals: [Exec approvals](/tools/exec-approvals)
- Nodes: [Nodes](/nodes)

## Common commands

```bash
nexa approvals get
nexa approvals get --node <id|name|ip>
nexa approvals get --gateway
```

## Replace approvals from a file

```bash
nexa approvals set --file ./exec-approvals.json
nexa approvals set --node <id|name|ip> --file ./exec-approvals.json
nexa approvals set --gateway --file ./exec-approvals.json
```

## Allowlist helpers

```bash
nexa approvals allowlist add "~/Projects/**/bin/rg"
nexa approvals allowlist add --agent main --node <id|name|ip> "/usr/bin/uptime"
nexa approvals allowlist add --agent "*" "/usr/bin/uname"

nexa approvals allowlist remove "~/Projects/**/bin/rg"
```

## Notes

- `--node` uses the same resolver as `nexa nodes` (id, name, ip, or id prefix).
- `--agent` defaults to `"*"`, which applies to all agents.
- The node host must advertise `system.execApprovals.get/set` (macOS app or headless node host).
- Approvals files are stored per host at `~/.nexa/exec-approvals.json`.
