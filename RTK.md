# RTK - Rust Token Killer (Codex CLI)

**Usage**: Token-optimized CLI proxy for shell commands.

## Rule

Always prefix shell commands with `rtk`.

Examples:

```bash
rtk git status
rtk cargo test
rtk npm run build
rtk pytest -q
```

## Meta Commands

```bash
rtk gain            # Token savings analytics
rtk gain --history  # Recent command savings history
rtk proxy <cmd>     # Run raw command without filtering
```

## Verification

```bash
rtk --version
rtk gain
which rtk
```

## Cypress

Preferred one-shot run:

```bash
rtk pnpm test:e2e
```

This runs `scripts/run-cypress.sh`: bootstrap Node from NVM if needed, start Astro, wait for `http://127.0.0.1:4321`, run Cypress, then stop server automatically.

Manual fallback:

```bash
export PATH=/home/kalerxx66/.nvm/versions/node/v24.17.0/bin:$PATH
export XDG_CONFIG_HOME=/tmp/codex-astro-config
rtk pnpm dev
rtk pnpm exec cypress run
```

If Codex sandbox blocks localhost bind or access, request unsandboxed run for `rtk pnpm test:e2e`, or for both manual commands above.
