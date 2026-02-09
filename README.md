# @lxgicstudios/debug-env

[![npm version](https://img.shields.io/npm/v/@lxgicstudios/debug-env)](https://www.npmjs.com/package/@lxgicstudios/debug-env)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](https://www.npmjs.com/package/@lxgicstudios/debug-env)

One command to show your complete debug environment. Node version, npm, OS, arch, shell, terminal, git, CPU, memory, and more. Copy-paste it into bug reports. Zero dependencies.

## Install

```bash
# Run directly with npx
npx @lxgicstudios/debug-env

# Or install globally
npm install -g @lxgicstudios/debug-env
```

## Usage

```bash
# Colorful terminal output
debug-env

# Markdown table for GitHub issues
debug-env --markdown

# Copy to clipboard (macOS)
debug-env --markdown | pbcopy

# JSON for scripts and automation
debug-env --json
```

## Features

- **Runtime versions** - Node.js, npm, yarn, pnpm, bun
- **System info** - OS, architecture, CPU model, core count, memory
- **Environment** - Shell, terminal, locale, timezone, env var count
- **Tools** - Git, Docker, Python versions
- **CI detection** - Spots GitHub Actions, GitLab CI, CircleCI, Jenkins, Travis, Vercel, Netlify
- **Package manager** - Auto-detects from lockfile (npm, yarn, pnpm, bun)
- **Global packages** - Lists globally installed npm packages
- **Multiple formats** - Terminal, Markdown, JSON
- **Zero dependencies** - Built with Node.js builtins only

## Options

| Option | Description |
|--------|-------------|
| `--markdown` | Output as markdown table (great for GitHub issues) |
| `--json` | Output as JSON |
| `--help` | Show help message |
| `--version` | Show version number |

## Sample Output (Markdown)

| Category | Detail | Value |
|----------|--------|-------|
| Runtime | Node.js | v22.22.0 |
| Runtime | npm | 10.9.0 |
| System | OS | darwin 24.5.0 |
| System | Architecture | arm64 |
| System | CPU | Apple M2 |
| Env | Shell | /bin/zsh |
| Tools | Git | 2.43.0 |

## License

MIT - [LXGIC Studios](https://lxgicstudios.com)
