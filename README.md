<div align="center">

# 🏢 Agentic Hub Office

**The Spatial 3D Multi-Agent Workspace & Autonomous Swarm Orchestration Engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%207.x-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black.svg?style=flat-square&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-203%2F203%20Passing-brightgreen.svg?style=flat-square)](tests/)

[**Quickstart**](#-quickstart) · [**Swarm Architecture**](#-autonomous-swarm-dag-engine) · [**Squad Presets**](#-curated-swarm-squad-presets) · [**Boss Laptop IDE**](#-boss-laptop-workspace--in-world-ide) · [**Multi-Provider AI**](#-multi-provider-ai-runtime) · [**Mobile Companion**](#-mobile-companion-mode-lite)

</div>

---

## 🌟 Executive Overview

**Agentic Hub Office** turns autonomous software engineering into a collaborative, spatial 3D experience. Instead of wrestling with fragmented terminal tabs, disjointed chat interfaces, and uncoordinated background scripts, Agentic Hub visualizes your entire AI workforce as interactive engineers seated at physical desks in an active real-time office.

Watch autonomous agents write code, inspect live terminal mirrors in 3D or 2D, collaborate on shared whiteboards, inspect architectural DAGs, and dispatch pre-configured specialist squads with topological Git worktree chaining.

```
       ┌────────────────────────────────────────────────────────┐
       │              Agentic Hub Swarm Orchestrator            │
       └────────────────────────────────────────────────────────┘
                                    │
                    [ 1-Click Swarm Squad Preset ]
              (Full-Stack / Security / Performance / AGY)
                                    │
                          ▼──────────────────▼
                          │  Planner Agent   │
                          │ (Generates DAG)  │
                          ▲──────────────────▲
                                    │  (Vacates Conference Room)
                          ▼──────────────────▼
                          │    plan.json     │
                          │ Topological Tree │
                          ▲──────────────────▲
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
 ┌───────────────────────┐                     ┌───────────────────────┐
 │ Task 1: Backend Lead  │                     │ Task 2: UI Designer   │
 │ (Seated at Desk 1)    │                     │ (Seated at Desk 2)    │
 │ Git Worktree: branch-1│                     │ Git Worktree: branch-2│
 └───────────────────────┘                     └───────────────────────┘
             │                                             │
             ▼ (Auto-vacates on complete)                  ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │ Task 3: Verification & Integration Sentinel                         │
 │ (Inherits prerequisite branches into downstream staging worktree)   │
 └─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Capabilities

### 🌐 Spatial 3D Multi-Agent Office
- **Physical Desks & Laptops:** Every active AI worker occupies a desk with an interactive laptop screen projecting its live pseudo-terminal (PTY) in WebGL.
- **First-Person & Isometric Navigation:** Freely walk the floor with WASD + mouse look, or switch to an overhead isometric view.
- **Audio & Visual Feedback:** Workers bounce and chime when awaiting human approval, encountering a question, or finishing their assigned scope.
- **Focus Mode:** Click any desk or conference chair to open an edge-to-edge interactive terminal with full ANSI color, 256-color palettes, and mouse support.

### 🐝 Autonomous Swarm DAG Engine
- **Architectural Planner Phase:** Spawn a lead planner at the conference table. The planner analyzes repository context, maps dependencies, and writes `plan.json` before cleanly vacating the room.
- **Interactive Swarm DAG Visualizer:** Inspect task dependencies, execution layers, and worker assignments in an interactive Mermaid-rendered DAG with pan, zoom, and live status badges (`DONE`, `RUNNING`, `QUEUED`, `BLOCKED`, `FAILED`).
- **Topological Git Worktree Chaining:** Downstream tasks automatically inherit prerequisite branches into isolated git worktrees, preventing race conditions and merge collisions.
- **Zero-Touch Desk Turnover:** When a specialist finishes their work, they vacate their seat immediately (`kill('keep')`), freeing physical office capacity for next-in-line tasks.

### ⚡ Curated Swarm Squad Presets (1-Click Team Dispatch)
Jumpstart complex multi-agent workflows with pre-configured specialist squads:
1. 🚀 **Full-Stack Feature Squad:** Backend Architect, Frontend Designer, E2E Integration QA.
2. 🛡️ **Security & Hardening Swarm:** Security Auditor, Defensive Systems Engineer, Exploit Regression Tester.
3. ⚡ **Performance & Optimization Swarm:** System Profiler, Client Render Optimizer, Benchmark & Stress Tester.
4. 🪐 **Google Antigravity Autonomous Squad:** AGY Architecture Lead, AGY Interface Specialist, AGY Verification Sentinel (native `agy` provider).
5. 📚 **Documentation & DevEx Swarm:** Protocol & API Documenter, SDK & Tooling Engineer, Tutorial Assertion Tester.

### 💻 Boss Laptop Workspace & In-World IDE
- **Dedicated Executive Station:** Located at the Boss Desk in the corner office with custom glowing animations and spatial interaction.
- **Integrated Code & Markdown Editor:** Multi-file browser with syntax highlighting, live line numbers, split-pane Markdown previewer, and instant file saving.
- **Workspace File & Asset Inspector:** Browse repository files, view image assets, and audit generated artifacts directly within the spatial environment.
- **Office Command Center:** Quick metrics for office workers, task queue health, token burn rates, and git commit history.

### 🤖 Multi-Provider AI Runtime
Seamlessly spawn and combine workers across all major AI agent providers:
- **Google Antigravity (`agy`):** Native support for autonomous coding loops, trajectory logging, and deep repository refactoring.
- **Claude Code:** Anthropic terminal agent with effort levels (`low`, `medium`, `high`, `xhigh`, `max`).
- **OpenAI Codex & OpenCode:** Native local and cloud coding agents.
- **Grok, Muse, & DeepSeek Harness (ACP):** Model catalog interoperability with real-time token tracking.

### 📱 Mobile Companion Mode (`/lite`)
- Ultra-lightweight, 2D responsive interface for mobile devices, low-spec hardware, or bandwidth-constrained connections.
- Virtual keypad for mobile terminal control (Arrows, Tab, Esc, Ctrl+C).
- Real-time Swarm monitor with live progress bars, task pills, and 1-click squad quick-action chips.

---

## ⚡ Quickstart

### Prerequisites
- **Node.js** `>= 20.0.0`
- **Git** `>= 2.30.0`

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/isthatnkhl-byte/Agentic-Hub-office.git
cd Agentic-Hub-office

# Install dependencies
npm install

# Build client and server bundles
npm run build
```

### 2. Launch the Office
```bash
# Start local server on port 4600 with password protection
node bin/agent-office.js --port 4600 --password dev

# Or with global Cloudflare edge tunnel sharing:
node bin/agent-office.js --port 4600 --password dev --share
```

Open your browser at:
- **3D Spatial Office:** `http://localhost:4600`
- **2D Mobile View:** `http://localhost:4600/lite`

---

## 🛠️ CLI Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `--port <number>` | Server port to listen on | `4600` |
| `--host <address>` | Host address to bind to | `127.0.0.1` |
| `--password <pass>` | Authentication password for office access | `dev` |
| `--share` | Create a public edge tunnel via Cloudflare | `false` |
| `--no-open` | Prevent opening the default browser on launch | `false` |
| `--agent-args <args>` | Custom arguments passed to worker agent processes | `""` |

---

## 🧪 Testing & Verification

The codebase includes an automated test suite verifying server lifecycle, worker PTY dispatch, swarm planning, DAG layering, squad presets, and terminal emulation:

```bash
# Run all 203 automated test suites
npm test

# Run strict TypeScript typechecking
npm run typecheck
```

**Test Results:**
- 27 Test Suites
- 203 Tests Passing (100% Pass Rate)
- 0 TypeScript Compilation Errors

---

## 📁 Repository Layout

```
Agentic-Hub-office/
├── bin/
│   └── agent-office.js        # Executable CLI launcher
├── src/
│   ├── client/                # Three.js 3D world, WebGL canvas, HUD, modals
│   │   ├── ui/                # Meeting room, Boss Laptop IDE, Swarm DAG modal, terminal
│   │   ├── world/             # 3D desks, chairs, avatars, laptop screens, DAG layout
│   │   ├── lite.ts            # 2D mobile view implementation
│   │   └── main.ts            # 3D application entry point
│   ├── server/                # Node.js backend, PTY processes, task queues, swarm runner
│   │   ├── meetings.ts        # Conference room patterns, rounds, and token bounds
│   │   ├── swarm-plan.ts      # Plan validator, topological sorter, role inference
│   │   └── worktrees.ts       # Isolated Git worktree manager
│   └── shared/                # Shared TypeScript protocols, squad presets, schemas
│       ├── meetings.ts        # SWARM_SQUAD_PRESETS and squad prompt builder
│       └── protocol.ts        # WebSocket wire messages and data models
└── tests/                     # 203 unit and integration test assertions
```

---

## 📄 License

MIT License. Built for modern agentic AI engineering teams.