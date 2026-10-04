# Amoeba Workspace Guide — Agentic Hub Office

## 1. Project Overview & Hackathon Mission
**Agentic Hub Office** is a spatial 3D multi-agent collaborative engineering platform built for autonomous software development. It bridges virtual 3D office environments (Three.js) with real-world agent orchestration (Node-PTY, Git worktrees, multi-provider LLM CLI execution).

## 2. Team Division & Active Roles
- **Developer 1 (Core Systems & Orchestration)**:
  - Headless PTY engine (`src/server/ptys.ts`, `src/server/ptyhost.ts`)
  - Multi-provider AI agent runtime (`src/server/agents.ts`, `codex.ts`, `grok.ts`, `opencode.ts`, `muse.ts`, `models.ts`)
  - Real-time regex auto-approval prompt gates (`src/server/prompts.ts`, `src/shared/prompts.ts`)
  - Topological swarm planner & DAG scheduler (`src/server/swarm-plan.ts`, `swarm-context.ts`, `tasks.ts`, `queue.ts`)
  - Sandboxed Git worktree management & branch chaining (`src/server/worktrees.ts`, `changes.ts`)
  - Swarm conference room coordinator (`src/server/meetings.ts`)
- **Developer 2 (Spatial Experience & Frontend)**:
  - Procedural Blender 3D asset generation & GLTF toon shaders (`blender/`, `src/client/world/`)
  - Interactive terminal mirrors & Xterm.js modals (`src/client/ui/terminal.ts`, `termkeys.ts`)
  - Player controller & collision sliding response (`src/client/player.ts`)
  - Swarm conference HUD & 2D Lite dashboard (`src/client/ui/meeting.ts`, `lite.html`, `lite.ts`)

## 3. Scope Pruning (Zero Toy Minigames)
In accordance with our hackathon engineering plan, all distracting minigames and non-essential physics have been pruned from the production codebase:
- ❌ Basketball court & ball simulation (`court.ts`, `hoop.ts`, `throwing.ts`)
- ❌ Cars & vehicle simulation (`cars.ts`, `driving.ts`, `garage.ts`)
- ❌ Golf minigame (`golf.ts`)
- ❌ Bar & arcade minigames (`bargames.ts`, `drunk.ts`, `booze.ts`)

## 4. Verification & Validation Commands
- **Unit Test Suite**: `npm test` (Runs 138 automated unit tests across all core systems)
- **TypeScript Compiler Check**: `npm run typecheck` (`tsc -p tsconfig.server.json --noEmit && tsc -p tsconfig.client.json --noEmit`)
- **Server Compilation**: `npm run build:server` (`tsc -p tsconfig.server.json`)
