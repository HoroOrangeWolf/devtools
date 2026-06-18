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

Use Linux Node from NVM in this repo:

```bash
export PATH=/home/kalerxx66/.nvm/versions/node/v24.17.0/bin:$PATH
export XDG_CONFIG_HOME=/tmp/codex-astro-config
```

Start app server:

```bash
rtk pnpm dev
```

Run Cypress in separate shell:

```bash
rtk pnpm exec cypress run
```

If Codex sandbox blocks localhost bind or access, request unsandboxed run for both `rtk pnpm dev` and `rtk pnpm exec cypress run`.
