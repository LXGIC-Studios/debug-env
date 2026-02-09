#!/usr/bin/env node

import { execSync } from "node:child_process";
import { platform, arch, release, hostname, cpus, totalmem, freemem, homedir, tmpdir, userInfo } from "node:os";
import { existsSync } from "node:fs";
import { join } from "node:path";

// ── ANSI Colors ──
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const VERSION = "1.0.0";

// ── Helpers ──
function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

// ── Info Gatherers ──
interface EnvInfo {
  node: string;
  npm: string;
  yarn: string;
  pnpm: string;
  bun: string;
  os: string;
  osVersion: string;
  arch: string;
  hostname: string;
  shell: string;
  terminal: string;
  git: string;
  docker: string;
  python: string;
  cpu: string;
  cpuCores: number;
  memTotal: string;
  memFree: string;
  homedir: string;
  tmpdir: string;
  username: string;
  cwd: string;
  envVarCount: number;
  locale: string;
  timezone: string;
  ci: string | false;
  packageManager: string;
  globalPackages: string[];
}

function gatherInfo(): EnvInfo {
  const shellPath = process.env.SHELL || process.env.COMSPEC || "";
  const termProgram = process.env.TERM_PROGRAM || process.env.TERMINAL_EMULATOR || "";
  const cpuInfo = cpus();

  // Detect CI
  let ci: string | false = false;
  if (process.env.CI) ci = "generic";
  if (process.env.GITHUB_ACTIONS) ci = "GitHub Actions";
  if (process.env.GITLAB_CI) ci = "GitLab CI";
  if (process.env.CIRCLECI) ci = "CircleCI";
  if (process.env.JENKINS_URL) ci = "Jenkins";
  if (process.env.TRAVIS) ci = "Travis CI";
  if (process.env.CODEBUILD_BUILD_ID) ci = "AWS CodeBuild";
  if (process.env.VERCEL) ci = "Vercel";
  if (process.env.NETLIFY) ci = "Netlify";

  // Detect package manager
  let packageManager = "npm";
  if (existsSync(join(process.cwd(), "yarn.lock"))) packageManager = "yarn";
  else if (existsSync(join(process.cwd(), "pnpm-lock.yaml"))) packageManager = "pnpm";
  else if (existsSync(join(process.cwd(), "bun.lockb"))) packageManager = "bun";

  // Global packages
  let globalPackages: string[] = [];
  const globalOutput = run("npm list -g --depth=0 --json 2>/dev/null");
  if (globalOutput) {
    try {
      const parsed = JSON.parse(globalOutput);
      if (parsed.dependencies) {
        globalPackages = Object.keys(parsed.dependencies);
      }
    } catch {
      // nope
    }
  }

  return {
    node: process.version,
    npm: run("npm --version"),
    yarn: run("yarn --version"),
    pnpm: run("pnpm --version"),
    bun: run("bun --version"),
    os: platform(),
    osVersion: release(),
    arch: arch(),
    hostname: hostname(),
    shell: shellPath,
    terminal: termProgram,
    git: run("git --version").replace("git version ", ""),
    docker: run("docker --version").replace("Docker version ", "").split(",")[0],
    python: run("python3 --version").replace("Python ", "") || run("python --version").replace("Python ", ""),
    cpu: cpuInfo[0]?.model || "unknown",
    cpuCores: cpuInfo.length,
    memTotal: formatBytes(totalmem()),
    memFree: formatBytes(freemem()),
    homedir: homedir(),
    tmpdir: tmpdir(),
    username: userInfo().username,
    cwd: process.cwd(),
    envVarCount: Object.keys(process.env).length,
    locale: process.env.LANG || process.env.LC_ALL || "unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ci,
    packageManager,
    globalPackages,
  };
}

// ── Terminal Output ──
function printTerminal(info: EnvInfo): void {
  const row = (label: string, value: string) => {
    if (!value) return;
    console.log(`  ${c.dim}${label.padEnd(20)}${c.reset} ${value}`);
  };

  console.log("");
  console.log(`${c.bold}${c.cyan}  debug-env${c.reset} ${c.dim}system environment report${c.reset}`);
  console.log(`${c.dim}  ${"─".repeat(50)}${c.reset}`);

  console.log(`\n${c.bold}${c.yellow}  Runtime${c.reset}`);
  row("Node.js", `${c.green}${info.node}${c.reset}`);
  row("npm", info.npm);
  if (info.yarn) row("yarn", info.yarn);
  if (info.pnpm) row("pnpm", info.pnpm);
  if (info.bun) row("bun", info.bun);
  row("Package Manager", `${c.blue}${info.packageManager}${c.reset}`);

  console.log(`\n${c.bold}${c.yellow}  System${c.reset}`);
  row("OS", `${info.os} ${info.osVersion}`);
  row("Architecture", info.arch);
  row("Hostname", info.hostname);
  row("CPU", info.cpu);
  row("CPU Cores", String(info.cpuCores));
  row("Memory (total)", info.memTotal);
  row("Memory (free)", info.memFree);

  console.log(`\n${c.bold}${c.yellow}  Environment${c.reset}`);
  row("Shell", info.shell);
  row("Terminal", info.terminal || "unknown");
  row("Username", info.username);
  row("Home", info.homedir);
  row("CWD", info.cwd);
  row("Temp Dir", info.tmpdir);
  row("Locale", info.locale);
  row("Timezone", info.timezone);
  row("Env Vars", `${info.envVarCount} variables`);
  if (info.ci) row("CI", `${c.magenta}${info.ci}${c.reset}`);

  console.log(`\n${c.bold}${c.yellow}  Tools${c.reset}`);
  if (info.git) row("Git", info.git);
  if (info.docker) row("Docker", info.docker);
  if (info.python) row("Python", info.python);

  if (info.globalPackages.length > 0) {
    console.log(`\n${c.bold}${c.yellow}  Global npm Packages${c.reset}`);
    for (const pkg of info.globalPackages.slice(0, 20)) {
      console.log(`  ${c.dim}-${c.reset} ${pkg}`);
    }
    if (info.globalPackages.length > 20) {
      console.log(`  ${c.dim}... and ${info.globalPackages.length - 20} more${c.reset}`);
    }
  }

  console.log("");
}

// ── Markdown Output ──
function printMarkdown(info: EnvInfo): void {
  const lines: string[] = [];

  lines.push("## Environment");
  lines.push("");
  lines.push("| Category | Detail | Value |");
  lines.push("|----------|--------|-------|");
  lines.push(`| Runtime | Node.js | ${info.node} |`);
  lines.push(`| Runtime | npm | ${info.npm} |`);
  if (info.yarn) lines.push(`| Runtime | yarn | ${info.yarn} |`);
  if (info.pnpm) lines.push(`| Runtime | pnpm | ${info.pnpm} |`);
  if (info.bun) lines.push(`| Runtime | bun | ${info.bun} |`);
  lines.push(`| Runtime | Package Manager | ${info.packageManager} |`);
  lines.push(`| System | OS | ${info.os} ${info.osVersion} |`);
  lines.push(`| System | Architecture | ${info.arch} |`);
  lines.push(`| System | CPU | ${info.cpu} |`);
  lines.push(`| System | CPU Cores | ${info.cpuCores} |`);
  lines.push(`| System | Memory (total) | ${info.memTotal} |`);
  lines.push(`| System | Memory (free) | ${info.memFree} |`);
  lines.push(`| Env | Shell | ${info.shell} |`);
  lines.push(`| Env | Terminal | ${info.terminal || "unknown"} |`);
  lines.push(`| Env | Locale | ${info.locale} |`);
  lines.push(`| Env | Timezone | ${info.timezone} |`);
  lines.push(`| Env | Env Vars | ${info.envVarCount} |`);
  if (info.ci) lines.push(`| Env | CI | ${info.ci} |`);
  if (info.git) lines.push(`| Tools | Git | ${info.git} |`);
  if (info.docker) lines.push(`| Tools | Docker | ${info.docker} |`);
  if (info.python) lines.push(`| Tools | Python | ${info.python} |`);

  if (info.globalPackages.length > 0) {
    lines.push("");
    lines.push("### Global npm Packages");
    lines.push("");
    lines.push("```");
    for (const pkg of info.globalPackages) {
      lines.push(pkg);
    }
    lines.push("```");
  }

  console.log(lines.join("\n"));
}

// ── JSON Output ──
function printJSON(info: EnvInfo): void {
  console.log(JSON.stringify(info, null, 2));
}

// ── Help ──
function printHelp(): void {
  console.log(`
${c.bold}${c.cyan}  debug-env${c.reset} ${c.dim}v${VERSION}${c.reset}
${c.dim}  Show your complete debug environment info${c.reset}

${c.bold}  USAGE${c.reset}
    ${c.green}$ debug-env${c.reset}
    ${c.green}$ debug-env --markdown${c.reset}
    ${c.green}$ debug-env --json${c.reset}

${c.bold}  OPTIONS${c.reset}
    ${c.yellow}--markdown${c.reset}     Output as markdown table (for bug reports)
    ${c.yellow}--json${c.reset}         Output as JSON
    ${c.yellow}--help${c.reset}         Show this help message
    ${c.yellow}--version${c.reset}      Show version number

${c.bold}  WHAT IT SHOWS${c.reset}
    ${c.blue}Runtime${c.reset}        Node.js, npm, yarn, pnpm, bun versions
    ${c.blue}System${c.reset}         OS, arch, CPU, memory, hostname
    ${c.blue}Environment${c.reset}    Shell, terminal, locale, timezone, env var count
    ${c.blue}Tools${c.reset}          Git, Docker, Python versions
    ${c.blue}CI${c.reset}             Detects GitHub Actions, GitLab CI, CircleCI, etc.
    ${c.blue}Packages${c.reset}       Global npm packages

${c.bold}  EXAMPLES${c.reset}
    ${c.dim}# Quick terminal overview${c.reset}
    ${c.green}$ debug-env${c.reset}

    ${c.dim}# Copy markdown for a GitHub issue${c.reset}
    ${c.green}$ debug-env --markdown | pbcopy${c.reset}

    ${c.dim}# Save JSON for automation${c.reset}
    ${c.green}$ debug-env --json > env-report.json${c.reset}
`);
}

// ── Main ──
function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    process.exit(0);
  }

  const info = gatherInfo();

  if (args.includes("--json")) {
    printJSON(info);
  } else if (args.includes("--markdown") || args.includes("--md")) {
    printMarkdown(info);
  } else {
    printTerminal(info);
  }
}

main();
