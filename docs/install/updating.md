---
summary: "Updating Nexa safely (global install or source), plus rollback strategy"
read_when:
  - Updating Nexa
  - Something breaks after an update
title: "Updating"
---

# Updating

Nexa is moving fast (pre “1.0”). Treat updates like shipping infra: update → run checks → restart (or use `nexa update`, which restarts) → verify.

## Recommended: re-run the website installer (upgrade in place)

The **preferred** update path is to re-run the installer from the website. It
detects existing installs, upgrades in place, and runs `nexa doctor` when
needed.

```bash
curl -fsSL https://nexa.ai/install.sh | bash
```

Notes:

- Add `--no-onboard` if you don’t want the onboarding wizard to run again.
- For **source installs**, use:

  ```bash
  curl -fsSL https://nexa.ai/install.sh | bash -s -- --install-method git --no-onboard
  ```

  The installer will `git pull --rebase` **only** if the repo is clean.

- For **global installs**, the script uses `npm install -g nexa@latest` under the hood.
- Legacy note: `clawdbot` remains available as a compatibility shim.

## Before you update

- Know how you installed: **global** (npm/pnpm) vs **from source** (git clone).
- Know how your Gateway is running: **foreground terminal** vs **supervised service** (launchd/systemd).
- Snapshot your tailoring:
  - Config: `~/.nexa/nexa.json`
  - Credentials: `~/.nexa/credentials/`
  - Workspace: `~/.nexa/workspace`

## Update (global install)

Global install (pick one):

```bash
npm i -g nexa@latest
```

```bash
pnpm add -g nexa@latest
```

We do **not** recommend Bun for the Gateway runtime (WhatsApp/Telegram bugs).

To switch update channels (git + npm installs):

```bash
nexa update --channel beta
nexa update --channel dev
nexa update --channel stable
```

Use `--tag <dist-tag|version>` for a one-off install tag/version.

See [Development channels](/install/development-channels) for channel semantics and release notes.

Note: on npm installs, the gateway logs an update hint on startup (checks the current channel tag). Disable via `update.checkOnStart: false`.

Then:

```bash
nexa doctor
nexa gateway restart
nexa health
```

Notes:

- If your Gateway runs as a service, `nexa gateway restart` is preferred over killing PIDs.
- If you’re pinned to a specific version, see “Rollback / pinning” below.

## Update (`nexa update`)

For **source installs** (git checkout), prefer:

```bash
nexa update
```

It runs a safe-ish update flow:

- Requires a clean worktree.
- Switches to the selected channel (tag or branch).
- Fetches + rebases against the configured upstream (dev channel).
- Installs deps, builds, builds the Control UI, and runs `nexa doctor`.
- Restarts the gateway by default (use `--no-restart` to skip).

If you installed via **npm/pnpm** (no git metadata), `nexa update` will try to update via your package manager. If it can’t detect the install, use “Update (global install)” instead.

## Update (Control UI / RPC)

The Control UI has **Update & Restart** (RPC: `update.run`). It:

1. Runs the same source-update flow as `nexa update` (git checkout only).
2. Writes a restart sentinel with a structured report (stdout/stderr tail).
3. Restarts the gateway and pings the last active session with the report.

If the rebase fails, the gateway aborts and restarts without applying the update.

## Update (from source)

From the repo checkout:

Preferred:

```bash
nexa update
```

Manual (equivalent-ish):

```bash
git pull
pnpm install
pnpm build
pnpm ui:build # auto-installs UI deps on first run
nexa doctor
nexa health
```

Notes:

- `pnpm build` matters when you run the packaged `nexa` binary ([`nexa.mjs`](https://github.com/nexa/nexa/blob/main/nexa.mjs)) or use Node to run `dist/`.
- If you run from a repo checkout without a global install, use `pnpm nexa ...` for CLI commands.
- If you run directly from TypeScript (`pnpm nexa ...`), a rebuild is usually unnecessary, but **config migrations still apply** → run doctor.
- Switching between global and git installs is easy: install the other flavor, then run `nexa doctor` so the gateway service entrypoint is rewritten to the current install.

## Always Run: `nexa doctor`

Doctor is the “safe update” command. It’s intentionally boring: repair + migrate + warn.

Note: if you’re on a **source install** (git checkout), `nexa doctor` will offer to run `nexa update` first.

Typical things it does:

- Migrate deprecated config keys / legacy config file locations.
- Audit DM policies and warn on risky “open” settings.
- Check Gateway health and can offer to restart.
- Detect and migrate older gateway services (launchd/systemd; legacy schtasks) to current Nexa services.
- On Linux, ensure systemd user lingering (so the Gateway survives logout).

Details: [Doctor](/gateway/doctor)

## Start / stop / restart the Gateway

CLI (works regardless of OS):

```bash
nexa gateway status
nexa gateway stop
nexa gateway restart
nexa gateway --port 18789
nexa logs --follow
```

If you’re supervised:

- macOS launchd (app-bundled LaunchAgent): `launchctl kickstart -k gui/$UID/bot.molt.gateway` (use `bot.molt.<profile>`; legacy `com.nexa.*` still works)
- Linux systemd user service: `systemctl --user restart nexa-gateway[-<profile>].service`
- Windows (WSL2): `systemctl --user restart nexa-gateway[-<profile>].service`
  - `launchctl`/`systemctl` only work if the service is installed; otherwise run `nexa gateway install`.

Runbook + exact service labels: [Gateway runbook](/gateway)

## Rollback / pinning (when something breaks)

### Pin (global install)

Install a known-good version (replace `<version>` with the last working one):

```bash
npm i -g nexa@<version>
```

```bash
pnpm add -g nexa@<version>
```

Tip: to see the current published version, run `npm view nexa version`.

Then restart + re-run doctor:

```bash
nexa doctor
nexa gateway restart
```

### Pin (source) by date

Pick a commit from a date (example: “state of main as of 2026-01-01”):

```bash
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
```

Then reinstall deps + restart:

```bash
pnpm install
pnpm build
nexa gateway restart
```

If you want to go back to latest later:

```bash
git checkout main
git pull
```

## If you’re stuck

- Run `nexa doctor` again and read the output carefully (it often tells you the fix).
- Check: [Troubleshooting](/gateway/troubleshooting)
- Ask in Discord: [https://discord.gg/clawd](https://discord.gg/clawd)
