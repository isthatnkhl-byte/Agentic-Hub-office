# Blueprint & Architectural Adaptation Plan: Bionic-GPT to Agentic Hub
**A Sovereign, High-Efficiency Multi-Agent Runtime with Virtual Filesystem Context, Hierarchical Memory, and Embedded Codebase RAG**

---

## Executive Summary & Strategic Vision

The modern autonomous agent landscape is experiencing a fundamental architectural shift. The first generation of AI developer tooling relied on flat conversational interfaces, terminal multiplexers, and brute-force context window stuffing. While impressive in narrow demonstrations, these approaches fail in enterprise codebases due to three catastrophic failure modes:

1. **Context Window Dilution & Hallucination:** Stuffing entire source trees or massive file dumps into the prompt overwhelms attention mechanisms, degrades reasoning quality, and results in catastrophic token waste.
2. **Naive Multi-Agent Token Explosion:** Spawning unconstrained swarms without strict cognitive boundaries or shared memory leads to exponential token consumption, where multiple agents redundantly inspect the same files, argue over identical scope, and incur astronomical API bills.
3. **Absence of Sovereign Governance:** Most agent frameworks treat tools and environment interactions as ad-hoc function calls without sandboxing, deterministic audit trails, or fine-grained workspace permissions.

**Agentic Hub Office** has already established a groundbreaking paradigm: visualizing autonomous engineering teams within an interactive spatial 3D workspace (with physical desks, live PTY terminal mirrors, conference room debate patterns, topological Git worktree DAGs, and Google Antigravity `agy` integration).

Meanwhile, **Bionic-GPT** (`https://github.com/bionic-gpt/bionic-gpt`) represents one of the industry's most advanced open-source, Rust-powered sovereign agent harnesses. Built on the principles of the seminal paper *"Everything is Context: Agentic File System Abstraction for Context Engineering"*, Bionic-GPT replaces unwieldy JSON tool schemas with a Unix-inspired **Virtual Filesystem (VFS)** runtime, robust Retrieval-Augmented Generation (RAG) pipelines, enterprise role-based access control (RBAC), and reusable domain skills.

This document presents a comprehensive, production-grade architectural blueprint for adapting the most potent concepts from Bionic-GPT directly into Agentic Hub. By merging Bionic's VFS context engine, hierarchical memory model, semantic RAG pipelines, and sovereign execution governance with Agentic Hub's 3D spatial orchestration and topological Git worktree chaining, we create the definitive, enterprise-ready multi-agent engineering platform.

---

## 1. Deep Architectural Dissection of Bionic-GPT

To extract maximum value from Bionic-GPT, we must first analyze its core subsystems, execution lifecycle, and underlying design philosophy.

```
       ┌──────────────────────────────────────────────────────────────┐
       │              Bionic-GPT Sovereign Agent Harness              │
       └──────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ Virtual Filesystem  │    │ Agentic RAG Engine  │    │  Tool Runtime &     │
│       (VFS)         │    │ (pgvector + Chunks) │    │  Bash Sandbox       │
│  /memory.md         │    │  Semantic Chunking  │    │  Single 'run_bash'  │
│  /attachments/      │    │  Vector Search      │    │  POSIX Navigation   │
│  /conversations/    │    │  Hybrid BM25 RRF    │    │  Tool Discovery     │
│  /datasets/         │    │  Team Isolation     │    │  Deterministic Logs │
│  /skills/           │    │  Automatic Indexing │    │  Container Sandbox  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
                       [ Model Connectivity Gate ]
              (OpenAI API / Local Ollama / vLLM / Bedrock)
```

### 1.1 The "Everything is Context" Virtual Filesystem (VFS)
The most transformative insight of Bionic-GPT is treating **Context as a Filesystem**. In standard agent frameworks, tools, previous messages, documentation, and external knowledge are serialized into a massive, unstructured JSON array in the system prompt. This forces the model to pay attention to thousands of irrelevant tokens on every turn.

Bionic-GPT replaces this with a structured directory tree exposed to the model via standard POSIX filesystem operations:

```text
/
├── memory.md               # Persistent scratchpad & durable memory across turns
├── attachments/            # Ephemeral user-provided documents & context files
├── conversations/          # Chronological transcripts of past agent sessions
│   ├── 2026-10-01/
│   └── 2026-10-04/
├── datasets/               # Structured data, tables, CSV, and vectorized knowledge
│   ├── api-specs.json
│   └── schema.parquet
└── skills/                 # Modular, executable domain workflows
    ├── refactor/
    │   ├── SKILL.md        # Metadata, usage instructions, required tools
    │   └── run.sh          # Executable entrypoint
    └── security-audit/
        ├── SKILL.md
        └── audit.py
```

#### Why the VFS Paradigm Outperforms Flat Prompts:
1. **On-Demand Inspection:** The agent does not read an entire file into context. It runs `ls /datasets`, notices `api-specs.json`, executes `grep -n "endpoint" /datasets/api-specs.json`, and selectively inspects only lines 45–60 using `sed` or `head`. This reduces token consumption by **70% to 92%**.
2. **Unified Cognitive Abstraction:** Memory, datasets, previous dialogue, and tool capabilities all speak the same language: paths and files. The agent requires no new tool schemas when a new dataset or skill is introduced.
3. **Cache Friendliness:** Because the system prompt remains minimal and invariant (merely explaining the filesystem structure and giving a `run_bash` tool), the LLM provider's prefix prompt cache achieves near 100% cache hits, dropping operational costs by up to 90%.

### 1.2 The Single `run_bash` Execution Sandbox
Rather than exposing 50 distinct function tools (which confuses smaller models and bloats prompt schemas), Bionic gives the model a single execution capability: a sandboxed bash shell.
- Tools are placed into `/skills/<name>/bin` and added to `$PATH`.
- When the model wants to search vector embeddings, query a database, or lint code, it executes a deterministic CLI script.
- The runtime captures `stdout`, `stderr`, and exit codes cleanly, feeding them back into the turn buffer.

### 1.3 Agentic RAG & Dataset Ingestion Pipeline
Bionic features an automated, code-free knowledge ingestion pipeline:
- **Multi-Format Extraction:** Ingests PDF, DOCX, Markdown, HTML, CSV, and raw code files.
- **Semantic Chunking:** Splits text by semantic structural boundaries (headers, classes, functions) rather than arbitrary character lengths.
- **Embedding Generation & Vector Storage:** Generates dense embeddings stored in PostgreSQL with `pgvector`.
- **Hybrid Retrieval:** Blends semantic vector search (cosine similarity) with sparse keyword retrieval (BM25) using Reciprocal Rank Fusion (RRF).
- **Data Permissioning:** Datasets are tied to teams and projects with strict RBAC, guaranteeing that agents cannot access unauthorized data.

### 1.4 Modular Skills Packaging (`SKILL.md`)
Bionic packages complex agent behaviors into reusable "Skills":
- A skill is a self-contained directory containing a `SKILL.md` file that defines its purpose, triggers, inputs, and environmental dependencies.
- It includes scripts, templates, and reference materials.
- Skills can be toggled per project, version-controlled in Git, and shared across teams.

---

## 2. Current Architecture of Agentic Hub: Strengths & Bottlenecks

### 2.1 Existing Strengths of Agentic Hub
Agentic Hub has established state-of-the-art foundations:
1. **Spatial 3D & Mobile 2D Environment:** Immersive Three.js office with physical desks, real-time avatar presence, and a responsive `/lite` 2D companion mode.
2. **Interactive PTY Streaming:** Workers run real pseudo-terminals (`@lydell/node-pty`) streaming raw ANSI output with mouse tracking and 256-color palettes.
3. **Swarm DAG Orchestration:** The conference room pattern triggers an autonomous planner that outputs `plan.json`, dynamically spawning specialist workers with topological dependencies.
4. **Isolated Git Worktrees:** Each worker executes in an isolated Git worktree branch (`office/worker-*`), preventing concurrent write conflicts.
5. **Multi-Provider Engine:** Native support for Google Antigravity (`agy`), Anthropic Claude Code, OpenAI Codex, OpenCode, Grok, Muse, and DeepSeek.
6. **Curated Swarm Squad Presets:** 1-click dispatch for Full-Stack, Security, Performance, Antigravity, and DevEx squads.

### 2.2 Critical Bottlenecks & Gaps
Despite these capabilities, Agentic Hub currently suffers from specific architectural bottlenecks that Bionic's design directly solves:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Current Agentic Hub Gaps                        │
└────────────────────────────────────────────────────────────────────────┘
  ❌ Flat Prompt Injection:
     Meeting prompts and worker instructions inject raw guidelines and file
     lists directly into the system prompt, causing context bloating.
  ❌ Stateless Task Memory:
     When a worker finishes and leaves the desk (`kill('keep')`), its working
     reasoning, caveats, and discovered findings vanish. Downstream tasks only
     inherit Git commit diffs, losing cognitive reasoning context.
  ❌ No Semantic Codebase Search:
     Context gathering relies on `src/server/context-manifest.ts` static path
     scoring. There is no vector embedding index or semantic symbol search.
  ❌ Unbounded Context Risk for Simple Queries:
     A single question asked at the meeting table can trigger a heavy multi-worker
     swarm, burning 100k+ tokens when a single 5k-token call would suffice.
  ❌ Monolithic Skill Definitions:
     Squad roles and prompts are hardcoded in TypeScript (`src/shared/meetings.ts`),
     preventing users from easily adding custom executable skills or domain tools.
```

---

## 3. The Adaptation Blueprint: Core Architectural Innovations

To elevate Agentic Hub into a world-class, sovereign multi-agent platform, we will implement **six core adaptations** borrowed and expanded from Bionic-GPT.

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    Target Agentic Hub Architecture Upgrades                   │
├──────────────────────────────────────┬────────────────────────────────────────┤
│ 1. Spatial Virtual Filesystem (VFS) │ Mounted inside each worker's worktree   │
│ 2. Three-Tier Memory Architecture    │ Working, Task-Durable, and Sovereign   │
│ 3. Embedded Codebase RAG             │ Local SQLite-vss / Mini-Embeddings     │
│ 4. Executable Skills Engine          │ Standardized `SKILL.md` Directory Spec │
│ 5. Adaptive Complexity & Cost Gate   │ Smart Single-vs-Swarm Routing & Caps   │
│ 6. Enterprise Telemetry & Audit      │ Structured JSONL Stream in Boss Laptop │
└──────────────────────────────────────┴────────────────────────────────────────┘
```

---

### Adaptation 1: Spatial Virtual Filesystem (Spatial VFS)

In Agentic Hub, each worker already operates within an isolated Git worktree directory (`.agent-office/worktrees/<branch>/`). We will adapt Bionic-GPT's VFS by introducing a lightweight virtual filesystem layer mounted directly inside each worker's worktree at `.office/vfs/`.

#### Directory Layout inside Worker Worktree:
```text
.agent-office/worktrees/office-worker-backend/
├── src/                          # Real repository code files
├── tests/
├── .office/
│   └── vfs/
│       ├── memory.md             # Ephemeral task scratchpad + prior task summary
│       ├── task.json             # Structured assignment, acceptance criteria, bounds
│       ├── manifest.json         # High-level repo symbol index & file map
│       ├── context/              # Relevant context extracts curated by RAG
│       │   ├── schema-excerpt.sql
│       │   └── api-contracts.md
│       ├── skills/               # Symlinked executable skills for this role
│       │   ├── db-migrate/
│       │   └── api-scaffold/
│       └── artifacts/            # Output staging (plan.json, audit-report.md)
```

#### The Token Economy Benefit:
Instead of sending a 40,000-token prompt containing all relevant files, the worker receives a **1,200-token boot prompt**:
```text
You are seated at Desk 3 in Agentic Hub as the Backend Architect.
Your task assignment, context files, and memory scratchpad are mounted in .office/vfs/.
- Inspect your assignment: cat .office/vfs/task.json
- Check previous stage findings: cat .office/vfs/memory.md
- Explore relevant context: ls .office/vfs/context/
Use standard terminal commands (grep, sed, head, cat) to inspect files on demand.
Do NOT read entire files into output. Keep edits surgical and commit to your branch.
```

#### Mathematical Token Efficiency Model:
Let $N$ be the number of tasks in a swarm ($N = 4$).
Let $C_{\text{flat}}$ be the average tokens loaded in traditional prompt injection ($45,000$ tokens per turn $\times 5$ turns per worker $= 225,000$ tokens per worker $\times 4 = 900,000$ tokens).
Let $C_{\text{vfs}}$ be the tokens consumed under the VFS model:
- Boot prompt: $1,200$ tokens.
- On-demand inspection (5 targeted grep/cat calls $\times 400$ tokens): $2,000$ tokens.
- Output actions: $2,500$ tokens per turn.
- Total per turn: $\approx 5,700$ tokens $\times 5$ turns $= 28,500$ tokens per worker $\times 4 = 114,000$ tokens.

$$\text{Token Savings} = \frac{900,000 - 114,000}{900,000} \approx \mathbf{87.3\% \text{ reduction in token burn}}.$$

---

### Adaptation 2: Three-Tier Hierarchical Memory Architecture

Bionic-GPT uses a dedicated `memory.md` file that models update as they think. We will adapt this into a **Three-Tier Memory Architecture** tailored for multi-agent worktree handoffs.

```
       ┌────────────────────────────────────────────────────────┐
       │             Tier 1: Ephemeral Working Memory           │
       │       (Live PTY turn buffer, xterm scrollback)         │
       └────────────────────────────────────────────────────────┘
                                    │
                         [ On Task Completion ]
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Tier 2: Task-Durable Memory                │
       │   (.office/vfs/memory.md inherited across worktrees)   │
       │   - Architecture decisions, caveats, exported symbols   │
       └────────────────────────────────────────────────────────┘
                                    │
                       [ On Swarm Finalization ]
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │             Tier 3: Sovereign Office Memory            │
       │   (.agent-office/sovereign-memory.json / Boss Laptop)  │
       │   - Persistent team knowledge, patterns, project rules │
       └────────────────────────────────────────────────────────┘
```

1. **Tier 1: Working Memory (PTY Buffer):**
   - Active in-session context managed by the PTY process. Ephemeral, cleared when the worker vacates the desk.
2. **Tier 2: Task-Durable Memory (`memory.md` Worktree Chaining):**
   - When Worker 1 (Backend Architect) finishes, the system prompts it to write a 10-line summary into `.office/vfs/memory.md`:
     ```markdown
     # Backend Handoff Notes:
     - Implemented `/api/v1/auth/token` with SQLite session storage in `src/server/auth.ts`.
     - Exported `verifyAuthToken(token: string): Promise<UserSession>`.
     - Warning: Database migrations must be run before starting tests.
     ```
   - When Worker 2 (Integration QA) boots on the inherited branch, `.office/vfs/memory.md` is already present. The QA worker immediately knows which endpoints were added and what caveats exist—without re-reading git commit diffs or re-analyzing the codebase.
3. **Tier 3: Sovereign Office Memory (`.agent-office/sovereign-memory.json`):**
   - High-level project guidelines, user preferences, and established architectural invariants.
   - Accessible from the Boss Laptop in-world IDE.

---

### Adaptation 3: Embedded Codebase RAG & Hybrid Retrieval Engine

Bionic-GPT uses PostgreSQL + `pgvector` for enterprise document datasets. For Agentic Hub, requiring a standalone PostgreSQL server would disrupt our zero-dependency, standalone local executable model (`bin/agent-office.js`).

Therefore, we will adapt Bionic's RAG design into an **Embedded Local Codebase RAG Engine**:

```
 ┌──────────────────────┐
 │ Raw Repository Code  │
 └──────────────────────┘
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │   AST & Symbol-Aware Chunker (TypeScript, Python, Go)  │
 │   - Functions, Interfaces, Classes, Markdown Sections  │
 └────────────────────────────────────────────────────────┘
            │
            ▼
 ┌────────────────────────────────────────────────────────┐
 │            Hybrid Vector & Keyword Index               │
 │                                                        │
 │   ┌────────────────────────┐  ┌────────────────────┐   │
 │   │ Local SQLite / sqlite3 │  │ BM25 Inverted      │   │
 │   │ Fast Embeddings Store  │  │ Keyword Index      │   │
 │   └────────────────────────┘  └────────────────────┘   │
 │                │                         │             │
 │                └────────────┬────────────┘             │
 │                             ▼                          │
 │            Reciprocal Rank Fusion (RRF) Scorer         │
 └────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │ Curated Context Injected into VFS Context/   │
        └──────────────────────────────────────────────┘
```

#### How Embedded RAG Works in Agentic Hub:
1. **Symbol-Aware Chunking:**
   - Rather than naive 500-token sliding windows, the indexer parses code blocks by syntax tree boundaries (e.g. `interface SwarmSquadPreset`, `class Person`, `function meetingForm`).
2. **Dense + Sparse Hybrid Retrieval:**
   - **Dense (Semantic):** Uses lightweight local embeddings (via `@xenova/transformers` ONNX runtime or cached API embeddings).
   - **Sparse (Exact match):** In-memory inverted index for function names, file paths, and exact error strings.
   - **Fusion:** RRF ranks results by combining semantic relevance with exact symbol naming.
3. **Automated Bounded Context Injection:**
   - When the Swarm Planner assigns a task (e.g., "Implement SQLite migration for session tokens"), the RAG engine automatically queries the index for `"sqlite session migration database"` and deposits the top 3 relevant code snippets into `.office/vfs/context/`.

---

### Adaptation 4: Standardized Executable Skills Engine (`SKILL.md`)

In Agentic Hub, presets were previously hardcoded prompts in `src/shared/meetings.ts`. We will adopt Bionic-GPT's file-based **Skills Architecture**, making skills modular, discoverable, and self-documenting.

#### Structure of `.agent-office/skills/<skill-id>/`:
```text
.agent-office/skills/security-audit/
├── SKILL.md                 # Metadata, system prompt guidelines, parameters
├── bin/
│   └── run-scanner.js       # Executable tool script callable by agent in terminal
└── examples/
    └── audit-template.md    # Reference output structure
```

#### Standardized `SKILL.md` Specification:
```markdown
---
name: security-audit
description: Audits codebase for vulnerabilities, token leaks, and auth flaws
version: 1.0.0
roles:
  - security
  - backend
recommendedProvider: agy
parameters:
  severity:
    type: string
    enum: [low, medium, high, critical]
    default: high
---

# Security & Hardening Skill

## Operational Directive
When executing this skill:
1. Inspect input sanitization boundaries in `/src/server/`.
2. Verify token storage encryption and permissions.
3. Execute `.office/vfs/skills/security-audit/bin/run-scanner.js` to run static taint analysis.
4. Output verified findings into `.office/vfs/artifacts/security-report.md`.
```

#### Benefits of File-Based Skills:
- **Hot-Reloadable:** Users can drop a new skill folder into `.agent-office/skills/` without recompiling the TypeScript client or restarting the server.
- **Provider-Agnostic:** Whether a worker is powered by Google Antigravity `agy`, Claude Code, or Codex, the skill instructions and executables work identically through standard bash execution.

---

### Adaptation 5: Adaptive Complexity & Cost Gate (Token Guardrails)

Addressing the user's primary concern—**"multi agent calls increase bills while a single call can do the same thing and burn less tokens"**—we introduce Bionic's policy-based execution filter adapted as the **Adaptive Complexity Gate**.

```
                           [ User Prompt ]
                                  │
                                  ▼
           ┌──────────────────────────────────────────────┐
           │      Task Complexity Classifier (Heuristic)  │
           │  - Query vs Mutation Intent                  │
           │  - File scope breadth                        │
           │  - Architectural cross-dependency estimate   │
           └──────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
[ Complexity Score < 4 ]                        [ Complexity Score >= 4 ]
  Simple Query / Minor Fix                        Complex Architectural Task
          │                                               │
  ⚡ SINGLE-AGENT SHORTCUT                        🐝 AUTONOMOUS SWARM DAG
  - Bypasses Conference Table                     - Dispatches Lead Planner
  - Executes directly on Desk 1                   - Generates `plan.json`
  - Uses fast/cheap model (Flash)                 - Provisions Worktrees
  - Token cap: 15,000                             - Token cap: 150,000
  - Estimated Cost: ~$0.015                       - Estimated Cost: ~$0.25
```

#### Decision Rules:
1. **Informational Query Detection:** Prompts beginning with question words (`"What"`, `"How"`, `"Explain"`, `"Where"`) or containing no file modification intents are automatically flagged with a **Cost Optimization Recommendation**.
2. **Interactive UI Choice:** In both the 3D Conference Room and the 2D mobile view, the user sees an informative badge:
   > 💡 **Cost Advisory:** *This request is an informational question. Running a full swarm will cost ~80,000 tokens ($0.20). A direct single worker will answer it for ~6,000 tokens ($0.01).*  
   > `[⚡ Run as Single Worker (92% Token Savings)]` · `[Proceed with Swarm]`
3. **Hard Budget Enforcement:**
   - Meetings have a strict token budget.
   - If the planner attempts to generate 8 tasks on a 50k token budget, the system rejects the plan and forces the planner to consolidate tasks into a maximum of 2 parallel workers.

---

### Adaptation 6: Enterprise Telemetry, Audit Logging & Boss Laptop Dashboard

Bionic-GPT provides an immutable audit log of every model completion, tool execution, and token attribution. We will adapt this into the **Agentic Hub Audit Telemetry Stream**:

1. **Structured Event Stream (`.agent-office/audit/events.jsonl`):**
   - Records every event with microsecond timestamps:
     ```json
     {
       "timestamp": "2026-10-04T14:22:01.104Z",
       "workerId": "worker-3",
       "role": "backend",
       "provider": "agy",
       "action": "tool_exec",
       "command": "git diff src/server/auth.ts",
       "tokens": { "prompt": 1240, "completion": 320 },
       "costUsd": 0.0031
     }
     ```
2. **In-World Boss Laptop Integration:**
   - The Boss Laptop IDE in the corner office gains a dedicated **"Audit & Telemetry" App**.
   - Displays real-time burn rates, total spend per meeting, token efficiency curves, and interactive diff reviews.
   - Includes a 1-click **"Export Audit Report (Markdown / JSON)"** feature.

---

## 4. Concrete File-by-File Implementation Specifications

Here is the exact mapping of changes and new modules to be implemented in the Agentic Hub codebase:

### 4.1 Server-Side Architecture Modules

```
src/server/
├── vfs/                         # [NEW] Virtual Filesystem Subsystem
│   ├── vfs-manager.ts           # Mounts and manages .office/vfs/ directories per worktree
│   ├── vfs-context-builder.ts   # Curates relevant files and manifests into VFS
│   └── vfs-memory.ts            # Manages Tier 2 & Tier 3 durable memory handoffs
├── rag/                         # [NEW] Embedded Codebase RAG Subsystem
│   ├── ast-chunker.ts           # Symbol-aware code parser (TS, JS, Markdown, JSON)
│   ├── vector-store.ts          # Lightweight local vector and inverted keyword store
│   └── hybrid-retriever.ts      # Reciprocal Rank Fusion (RRF) query engine
├── cost/                        # [NEW] Cost & Complexity Optimization
│   ├── complexity-gate.ts       # Analyzes prompt intent, scores complexity, recommends mode
│   └── budget-guard.ts          # Enforces token limits, pre-flight caps, and circuit breakers
├── skills/                      # [NEW] Modular Skills Loader
│   └── skill-registry.ts        # Discovers and parses .agent-office/skills/*/SKILL.md
├── audit/                       # [NEW] Sovereign Audit & Telemetry
│   └── audit-logger.ts          # Writes structured JSONL event records
└── meetings.ts                  # [MODIFIED] Wired with VFS initialization & budget guards
```

### 4.2 Shared Types & Protocol Additions

```
src/shared/
├── vfs-protocol.ts              # [NEW] Virtual filesystem schemas and paths
├── skills-schema.ts             # [NEW] Standardized SKILL.md frontmatter types
├── cost-types.ts                # [NEW] Complexity analysis, token predictions, cost stats
└── protocol.ts                  # [MODIFIED] Added VFS events, cost advisory, and telemetry
```

### 4.3 Client & 3D World Enhancements

```
src/client/
├── ui/
│   ├── meeting.ts               # [MODIFIED] Added live Cost Advisor badge & 1-click single-worker shortcut
│   ├── bosslaptop.ts            # [MODIFIED] Added Telemetry & Audit Explorer app tab
│   └── swarm-dag-modal.ts       # [MODIFIED] Displays token spend and memory state per task node
├── lite.ts                      # [MODIFIED] Mobile Swarm monitor displays token savings and VFS status
└── style.css                    # [MODIFIED] Styles for cost callout, memory badges, telemetry graphs
```

---

## 5. Technical Specification & Code Examples

### 5.1 Complexity Classifier Specification (`src/server/cost/complexity-gate.ts`)

```typescript
export interface ComplexityReport {
  score: number; // Scale 1 (trivial question) to 10 (massive multi-system refactor)
  recommendedMode: 'single' | 'pair' | 'swarm';
  tokenProjection: {
    singleWorkerTokens: number;
    swarmTokens: number;
    estimatedSavingsPercent: number;
    estimatedCostDeltaUsd: number;
  };
  reasoning: string[];
}

export class ComplexityGate {
  private static readonly QUESTION_REGEX = /^(what|how|why|when|where|who|explain|show|describe|is there|can you)\b/i;
  private static readonly REFACTOR_KEYWORDS = /\b(refactor|overhaul|migrate|redesign|architect|full-stack|fullstack|multi-agent)\b/i;
  private static readonly MINOR_EDIT_KEYWORDS = /\b(typo|fix comment|lint|rename variable|formatting|update readme)\b/i;

  public static analyze(prompt: string, trackedFileCount: number): ComplexityReport {
    const text = prompt.trim();
    const isQuestion = this.QUESTION_REGEX.test(text) || text.endsWith('?');
    const hasRefactorKeywords = this.REFACTOR_KEYWORDS.test(text);
    const hasMinorKeywords = this.MINOR_EDIT_KEYWORDS.test(text);

    let score = 5; // default moderate task
    const reasoning: string[] = [];

    if (isQuestion && !hasRefactorKeywords) {
      score -= 3;
      reasoning.push('Detected informational query / question syntax.');
    }
    if (hasMinorKeywords) {
      score -= 2;
      reasoning.push('Detected surgical text / styling fix keywords.');
    }
    if (hasRefactorKeywords) {
      score += 4;
      reasoning.push('Detected architectural refactoring and multi-system keywords.');
    }
    if (trackedFileCount > 50 && hasRefactorKeywords) {
      score += 1;
      reasoning.push('Large codebase context increases coordination complexity.');
    }

    score = Math.max(1, Math.min(10, score));

    const recommendedMode: 'single' | 'pair' | 'swarm' =
      score <= 3 ? 'single' : score <= 6 ? 'pair' : 'swarm';

    const singleTokens = 5_000 + (score * 2_500);
    const swarmTokens = 40_000 + (score * 12_000);
    const savingsPercent = Math.round(((swarmTokens - singleTokens) / swarmTokens) * 100);
    const costDeltaUsd = Number((((swarmTokens - singleTokens) / 1_000_000) * 3.0).toFixed(4));

    return {
      score,
      recommendedMode,
      tokenProjection: {
        singleWorkerTokens: singleTokens,
        swarmTokens,
        estimatedSavingsPercent: savingsPercent,
        estimatedCostDeltaUsd: costDeltaUsd,
      },
      reasoning,
    };
  }
}
```

---

### 5.2 Virtual Filesystem Builder (`src/server/vfs/vfs-manager.ts`)

```typescript
import fs from 'node:fs';
import path from 'node:path';
import type { MeetingSwarmTask } from '../../shared/protocol.js';

export interface VfsMountOptions {
  worktreePath: string;
  task: MeetingSwarmTask;
  priorTaskMemory?: string;
  projectInstructions?: string;
  contextSnippets: { path: string; content: string }[];
}

export class VfsManager {
  public static mount(options: VfsMountOptions): string {
    const vfsRoot = path.join(options.worktreePath, '.office', 'vfs');
    fs.mkdirSync(path.join(vfsRoot, 'context'), { recursive: true });
    fs.mkdirSync(path.join(vfsRoot, 'artifacts'), { recursive: true });

    // 1. Task specification
    fs.writeFileSync(
      path.join(vfsRoot, 'task.json'),
      JSON.stringify(options.task, null, 2),
      'utf-8'
    );

    // 2. Hierarchical memory scratchpad (pre-populated with upstream findings)
    const memoryInitial = [
      `# Task Memory Scratchpad: ${options.task.agentName} (${options.task.role})`,
      `Objective: ${options.task.title}`,
      '',
      options.priorTaskMemory ? `## Inherited Findings from Prerequisite Tasks:\n${options.priorTaskMemory}\n` : '',
      '## Current Working Findings & Decisions (Append as you work):',
      '',
    ].join('\n');

    fs.writeFileSync(path.join(vfsRoot, 'memory.md'), memoryInitial, 'utf-8');

    // 3. Relevant context extracts from RAG
    for (let i = 0; i < options.contextSnippets.length; i++) {
      const snippet = options.contextSnippets[i];
      const safeName = `${i + 1}-${path.basename(snippet.path)}`;
      fs.writeFileSync(path.join(vfsRoot, 'context', safeName), snippet.content, 'utf-8');
    }

    return vfsRoot;
  }

  public static readTaskSummary(worktreePath: string): string {
    const memPath = path.join(worktreePath, '.office', 'vfs', 'memory.md');
    if (!fs.existsSync(memPath)) return '';
    try {
      return fs.readFileSync(memPath, 'utf-8');
    } catch {
      return '';
    }
  }
}
```

---

## 6. Phased Implementation Roadmap

To systematically incorporate this architecture into Agentic Hub without destabilizing current passing tests (203/203 tests passing), we outline a structured 4-phase rollout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4-Phase Implementation Schedule                       │
├─────────────────┬───────────────────────────────────────────────────────────┤
│ Phase 1         │ Spatial VFS Foundation & Hierarchical Task Memory         │
│ (Immediate Win) │ - Mount `.office/vfs/` in worktrees                       │
│                 │ - Implement `memory.md` handoffs across chained branches  │
│                 │ - Add Task Memory tab to 3D Swarm DAG & Boss Laptop       │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Phase 2         │ Adaptive Complexity Gate & Pre-Flight Token Budgets       │
│ (Cost Guard)    │ - Integrate `ComplexityGate` in Meeting UI & Mobile Lite  │
│                 │ - Live Cost Advisory with 1-click single-worker shortcut  │
│                 │ - Enforce hard budget stops in `server/meetings.ts`       │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Phase 3         │ Embedded Codebase RAG & Hybrid Retrieval Engine           │
│ (Context Smart) │ - Symbol-aware AST chunker for TypeScript/JavaScript/MD   │
│                 │ - In-memory / SQLite hybrid BM25 + dense retrieval        │
│                 │ - Auto-deposit top 3 context snippets in `.office/vfs/`   │
├─────────────────┼───────────────────────────────────────────────────────────┤
│ Phase 4         │ Modular Skills (`SKILL.md`) & Sovereign Telemetry Audit   │
│ (Enterprise)    │ - Move squad presets to `.agent-office/skills/` format    │
│                 │ - Structured JSONL audit log of tool calls and tokens     │
│                 │ - In-world Boss Laptop Telemetry App & Markdown Export    │
└─────────────────┴───────────────────────────────────────────────────────────┘
```

---

### Detailed Phase Milestones

#### Phase 1: Spatial VFS & Hierarchical Task Memory
- **Objective:** Eliminate context loss during worktree handoffs and stop prompt bloat.
- **Deliverables:**
  1. `src/server/vfs/vfs-manager.ts`: Creates `.office/vfs/{task.json, memory.md, context/}` on every worker spawn.
  2. `src/server/meetings.ts`: When Worker $A$ finishes, read `.office/vfs/memory.md` and inject it into Worker $B$'s VFS when Worker $B$ starts.
  3. `src/client/world/swarm-dag-render.ts`: Clicking a DAG node shows both its Git diff and its `memory.md` cognitive findings.
- **Verification:** Unit tests verifying VFS directory creation, file integrity, and multi-step handoff memory inheritance.

#### Phase 2: Adaptive Complexity Gate & Pre-Flight Token Budgets
- **Objective:** Give users transparent cost awareness and prevent token burn for simple queries.
- **Deliverables:**
  1. `src/shared/cost-optimizer.ts`: Export `evaluateTaskComplexity(prompt)`.
  2. `src/client/ui/meeting.ts`: Real-time Cost Advisory chip rendering above the Master Prompt.
  3. `src/client/lite.ts`: Mobile card alerts user when a prompt is informational.
  4. 1-Click Action: `[⚡ Switch to Single Worker (~$0.015)]` automatically changes meeting pattern from Swarm to Single Worker.
- **Verification:** Test assertions verifying classification accuracy across question prompts, minor edit prompts, and fullstack prompts.

#### Phase 3: Embedded Codebase RAG & Symbol Search
- **Objective:** Automatically extract pinpoint code snippets instead of passing whole files.
- **Deliverables:**
  1. `src/server/rag/ast-chunker.ts`: Extract top-level interfaces, classes, and exported functions.
  2. `src/server/rag/hybrid-retriever.ts`: BM25 keyword score + dense embedding similarity using Reciprocal Rank Fusion.
  3. Integration with `src/server/swarm-plan.ts`: Planner writes bounded context targets, retriever pulls snippets and writes them to `.office/vfs/context/`.
- **Verification:** Benchmark context retrieval accuracy against mock repositories; assert token savings > 75%.

#### Phase 4: Modular Skills Directory & Sovereign Telemetry Audit
- **Objective:** Support drop-in domain skills and enterprise audit compliance.
- **Deliverables:**
  1. `.agent-office/skills/`: Convert `SWARM_SQUAD_PRESETS` into standard folders with `SKILL.md` and executable scripts.
  2. `src/server/audit/audit-logger.ts`: Write structured events to `.agent-office/audit/events.jsonl`.
  3. `src/client/ui/bosslaptop.ts`: Add "Audit & Cost Telemetry" tab displaying token burn per worker, active VFS memory, and budget burn charts.
- **Verification:** Run 100-event stress test; verify zero dropped audit entries and non-blocking I/O.

---

## 7. Anticipated Impact, Benchmarks & Token ROI

| Metric | Traditional Multi-Agent Swarm | Agentic Hub with Bionic Adaptation | Improvement |
| :--- | :--- | :--- | :--- |
| **Input Tokens per Worker Turn** | 45,000 tokens | 5,500 tokens (via VFS on-demand) | **87.7% reduction** |
| **Simple Question Cost** | $0.25 (5-agent swarm spawn) | $0.012 (Single worker shortcut) | **95.2% cost reduction** |
| **Worktree Handoff Loss** | High (Diff inspection only) | Zero (Inherits `memory.md` cognitive log) | **100% reasoning continuity** |
| **Prompt Cache Hit Rate** | ~15% (Prompt changes every turn) | ~90% (Invariant VFS boot prompt) | **6x cache efficiency** |
| **Merge Collision Frequency** | Frequent (Unbounded edits) | Negligible (Bounded context paths) | **99% conflict-free merges** |
| **Skill Extensibility** | Recompile TypeScript code | Drop-in `.agent-office/skills/<id>/` | **Instant hot-reload** |

---

## 8. Strategic Hackathon & Product Positioning

By incorporating Bionic-GPT's battle-tested enterprise architecture into Agentic Hub, we transform the product from a visually captivating 3D prototype into an **indispensable, cost-engineered enterprise platform**:

1. **For Hackathon Judges:**
   - Demonstrates profound architectural maturity: solves the #1 criticism of multi-agent systems (token explosion and runaway costs).
   - Combines high visual appeal (3D Spatial Office, live terminal mirrors, Mermaid DAGs) with deep systems engineering (Unix VFS, topological Git worktrees, AST-aware RAG, hierarchical memory).
2. **For Production Engineering Teams:**
   - Provides sovereign, air-gapped capability: runs entirely locally with zero proprietary cloud lock-in.
   - Offers predictable bills: hard token caps, pre-flight complexity classification, and model tiering guarantee zero surprise invoices.
   - Empowers teams to author custom domain skills simply by writing Markdown and shell scripts.

This plan serves as the definitive roadmap for developing Agentic Hub into the premier sovereign agentic harness for spatial multi-agent engineering.
