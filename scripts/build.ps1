<#
.SYNOPSIS
  Full Nexa build for Windows (replaces `pnpm build` + `pnpm ui:build`).
.DESCRIPTION
  Runs every build step that the Unix `pnpm build` chain does, but avoids
  bash dependencies so it works natively in PowerShell.
#>
[CmdletBinding()]
param(
    [switch]$SkipA2UI,
    [switch]$SkipControlUI
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Invoke-StepCmd {
    param([string]$Label, [string]$Cmd, [string[]]$CmdArgs)
    Write-Step $Label
    & $Cmd @CmdArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $Label (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# ── 1. A2UI bundle (hash-based skip) ────────────────────────────────────
if (-not $SkipA2UI) {
    $bundleFile = Join-Path $RepoRoot 'src\canvas-host\a2ui\a2ui.bundle.js'
    $hashFile   = Join-Path $RepoRoot 'src\canvas-host\a2ui\.bundle.hash'
    $rendererDir = Join-Path $RepoRoot 'vendor\a2ui\renderers\lit'
    $appDir      = Join-Path $RepoRoot 'apps\shared\NexaKit\Tools\CanvasA2UI'

    if (-not (Test-Path $rendererDir) -or -not (Test-Path $appDir)) {
        if (Test-Path $bundleFile) {
            Write-Step 'A2UI sources missing; keeping prebuilt bundle.'
        } else {
            Write-Host 'A2UI sources missing and no prebuilt bundle.' -ForegroundColor Red
            exit 1
        }
    } else {
        $inputPaths = @(
            (Join-Path $RepoRoot 'package.json'),
            (Join-Path $RepoRoot 'pnpm-lock.yaml'),
            $rendererDir,
            $appDir
        )
        $hashScript = @"
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
const rootDir = process.env.ROOT_DIR ?? process.cwd();
const inputs = process.argv.slice(2);
const files = [];
async function walk(p) {
  const st = await fs.stat(p);
  if (st.isDirectory()) { for (const e of await fs.readdir(p)) await walk(path.join(p, e)); return; }
  files.push(p);
}
for (const i of inputs) await walk(i);
files.sort((a,b) => a.split(path.sep).join("/").localeCompare(b.split(path.sep).join("/")));
const h = createHash("sha256");
for (const f of files) { const r = path.relative(rootDir, f).split(path.sep).join("/"); h.update(r); h.update("\0"); h.update(await fs.readFile(f)); h.update("\0"); }
process.stdout.write(h.digest("hex"));
"@
        $env:ROOT_DIR = $RepoRoot
        $currentHash = ($hashScript | node --input-type=module - @inputPaths)
        $previousHash = if (Test-Path $hashFile) { Get-Content $hashFile -Raw } else { '' }

        if ($currentHash -eq $previousHash.Trim() -and (Test-Path $bundleFile)) {
            Write-Step 'A2UI bundle up to date; skipping.'
        } else {
            Invoke-StepCmd 'A2UI: tsc' 'pnpm' @('-s', 'exec', 'tsc', '-p', "$rendererDir\tsconfig.json")
            Invoke-StepCmd 'A2UI: rolldown' 'pnpm' @('-s', 'exec', 'rolldown', '-c', "$appDir\rolldown.config.mjs")
            Set-Content -Path $hashFile -Value $currentHash -NoNewline
        }
    }
} else {
    Write-Step 'Skipping A2UI bundle (-SkipA2UI).'
}

# ── 2. tsdown (TypeScript → dist/) ──────────────────────────────────────
Invoke-StepCmd 'tsdown' 'npx' @('tsdown')

# ── 3. Plugin SDK type declarations ─────────────────────────────────────
Invoke-StepCmd 'plugin-sdk DTS' 'pnpm' @('build:plugin-sdk:dts')

# ── 4. Post-build scripts ───────────────────────────────────────────────
$postScripts = @(
    @{ Label = 'write-plugin-sdk-entry-dts'; Script = 'scripts/write-plugin-sdk-entry-dts.ts' },
    @{ Label = 'canvas-a2ui-copy';           Script = 'scripts/canvas-a2ui-copy.ts' },
    @{ Label = 'copy-hook-metadata';         Script = 'scripts/copy-hook-metadata.ts' },
    @{ Label = 'write-build-info';           Script = 'scripts/write-build-info.ts' },
    @{ Label = 'write-cli-compat';           Script = 'scripts/write-cli-compat.ts' }
)
foreach ($s in $postScripts) {
    Invoke-StepCmd $s.Label 'node' @('--import', 'tsx', $s.Script)
}

# ── 5. Control UI (vite build) ──────────────────────────────────────────
if (-not $SkipControlUI) {
    Invoke-StepCmd 'Control UI build' 'node' @('scripts/ui.js', 'build')
} else {
    Write-Step 'Skipping Control UI (-SkipControlUI).'
}

Write-Host "`nBuild complete." -ForegroundColor Green
