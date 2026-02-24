# 🦞 Nexa — Personal AI Assistant

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/nexa/nexa/main/docs/assets/nexa-logo-text-dark.png">
        <img src="https://raw.githubusercontent.com/nexa/nexa/main/docs/assets/nexa-logo-text.png" alt="Nexa" width="500">
    </picture>
</p>

<p align="center">
  <strong>EXFOLIATE! EXFOLIATE!</strong>
</p>

<p align="center">
  <a href="https://github.com/nexa/nexa/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/nexa/nexa/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/nexa/nexa/releases"><img src="https://img.shields.io/github/v/release/nexa/nexa?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <a href="https://discord.gg/clawd"><img src="https://img.shields.io/discord/1456350064065904867?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Nexa** is a _personal AI assistant_ you run on your own devices.
It answers you on the channels you already use (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, WebChat), plus extension channels like BlueBubbles, Matrix, Zalo, and Zalo Personal. It can speak and listen on macOS/iOS/Android, and can render a live Canvas you control. The Gateway is just the control plane — the product is the assistant.

If you want a personal, single-user assistant that feels local, fast, and always-on, this is it.

[Website](https://nexa.ai) · [Docs](https://docs.nexa.ai) · [DeepWiki](https://deepwiki.com/nexa/nexa) · [Getting Started](https://docs.nexa.ai/start/getting-started) · [Updating](https://docs.nexa.ai/install/updating) · [Showcase](https://docs.nexa.ai/start/showcase) · [FAQ](https://docs.nexa.ai/start/faq) · [Wizard](https://docs.nexa.ai/start/wizard) · [Nix](https://github.com/nexa/nix-nexa) · [Docker](https://docs.nexa.ai/install/docker) · [Discord](https://discord.gg/clawd)

Preferred setup: run the onboarding wizard (`nexa onboard`) in your terminal.
The wizard guides you step by step through setting up the gateway, workspace, channels, and skills. The CLI wizard is the recommended path and works on **macOS, Linux, and Windows (via WSL2; strongly recommended)**.
Works with npm, pnpm, or bun.
New install? Start here: [Getting started](https://docs.nexa.ai/start/getting-started)

**Subscriptions (OAuth):**

- **[Anthropic](https://www.anthropic.com/)** (Claude Pro/Max)
- **[OpenAI](https://openai.com/)** (ChatGPT/Codex)

Model note: while any model is supported, I strongly recommend **Anthropic Pro/Max (100/200) + Opus 4.6** for long‑context strength and better prompt‑injection resistance. See [Onboarding](https://docs.nexa.ai/start/onboarding).

## Models (selection + auth)

- Models config + CLI: [Models](https://docs.nexa.ai/concepts/models)
- Auth profile rotation (OAuth vs API keys) + fallbacks: [Model failover](https://docs.nexa.ai/concepts/model-failover)

## Install (recommended)

Runtime: **Node ≥22**.

```bash
npm install -g nexa@latest
# or: pnpm add -g nexa@latest

nexa onboard --install-daemon
```

The wizard installs the Gateway daemon (launchd/systemd user service) so it stays running.

## Quick start (TL;DR)

Runtime: **Node ≥22**.

Full beginner guide (auth, pairing, channels): [Getting started](https://docs.nexa.ai/start/getting-started)

```bash
nexa onboard --install-daemon

nexa gateway --port 18789 --verbose

# Send a message
nexa message send --to +1234567890 --message "Hello from Nexa"

# Talk to the assistant (optionally deliver back to any connected channel: WhatsApp/Telegram/Slack/Discord/Google Chat/Signal/iMessage/BlueBubbles/Microsoft Teams/Matrix/Zalo/Zalo Personal/WebChat)
nexa agent --message "Ship checklist" --thinking high
```

Upgrading? [Updating guide](https://docs.nexa.ai/install/updating) (and run `nexa doctor`).

## Development channels

- **stable**: tagged releases (`vYYYY.M.D` or `vYYYY.M.D-<patch>`), npm dist-tag `latest`.
- **beta**: prerelease tags (`vYYYY.M.D-beta.N`), npm dist-tag `beta` (macOS app may be missing).
- **dev**: moving head of `main`, npm dist-tag `dev` (when published).

Switch channels (git + npm): `nexa update --channel stable|beta|dev`.
Details: [Development channels](https://docs.nexa.ai/install/development-channels).

## From source (development)

Prefer `pnpm` for builds from source. Bun is optional for running TypeScript directly.

```bash
git clone https://github.com/nexa/nexa.git
cd nexa

pnpm install
pnpm ui:build # auto-installs UI deps on first run
pnpm build

pnpm nexa onboard --install-daemon

# Dev loop (auto-reload on TS changes)
pnpm gateway:watch
```

Note: `pnpm nexa ...` runs TypeScript directly (via `tsx`). `pnpm build` produces `dist/` for running via Node / the packaged `nexa` binary.
