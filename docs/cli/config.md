---
summary: "CLI reference for `nexa config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `nexa config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `nexa configure`).

## Examples

```bash
nexa config get browser.executablePath
nexa config set browser.executablePath "/usr/bin/google-chrome"
nexa config set agents.defaults.heartbeat.every "2h"
nexa config set agents.list[0].tools.exec.node "node-id-or-name"
nexa config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
nexa config get agents.defaults.workspace
nexa config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
nexa config get agents.list
nexa config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
nexa config set agents.defaults.heartbeat.every "0m"
nexa config set gateway.port 19001 --json
nexa config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
