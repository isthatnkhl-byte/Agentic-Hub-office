import fs from 'node:fs';
import path from 'node:path';
import type { VfsContextSnippet, VfsManifest, VfsTaskSpec } from '../../shared/vfs-protocol.js';

export interface VfsMountOptions {
  worktreePath: string;
  task: VfsTaskSpec;
  priorTaskMemory?: string;
  contextSnippets?: VfsContextSnippet[];
  availableFiles?: string[];
  skills?: string[];
}

/**
 * Virtual Filesystem (VFS) and Hierarchical Memory Manager
 *
 * Implements the Bionic-GPT "Everything is Context" paradigm inside isolated Git worktrees.
 * Instead of dumping tens of thousands of tokens into the prompt, the agent receives an invariant
 * boot instruction and accesses its structured task, inherited memory, and RAG context extracts
 * on demand via standard terminal/filesystem tools.
 */
export class VfsManager {
  public static readonly VFS_REL_PATH = path.join('.office', 'vfs');

  /**
   * Mounts the VFS directory inside the target worktree.
   */
  public static mount(options: VfsMountOptions): string {
    const vfsRoot = path.join(options.worktreePath, this.VFS_REL_PATH);
    const contextDir = path.join(vfsRoot, 'context');
    const artifactsDir = path.join(vfsRoot, 'artifacts');

    fs.mkdirSync(contextDir, { recursive: true });
    fs.mkdirSync(artifactsDir, { recursive: true });

    // 1. Task specification (.office/vfs/task.json)
    const taskSpecPath = path.join(vfsRoot, 'task.json');
    fs.writeFileSync(taskSpecPath, JSON.stringify(options.task, null, 2), 'utf-8');

    // 2. Hierarchical memory scratchpad (.office/vfs/memory.md)
    const memoryPath = path.join(vfsRoot, 'memory.md');
    let memoryContent = '';
    if (fs.existsSync(memoryPath)) {
      try {
        memoryContent = fs.readFileSync(memoryPath, 'utf-8');
      } catch {
        // Fall back to template
      }
    }

    if (!memoryContent.trim()) {
      const memoryLines: string[] = [
        `# Cognitive Task Memory: ${options.task.title}`,
        `Role: ${options.task.role.toUpperCase()} (Task ID: ${options.task.id})`,
        `Started: ${new Date().toISOString()}`,
        '',
      ];

      if (options.priorTaskMemory && options.priorTaskMemory.trim()) {
        memoryLines.push(
          '## 🧠 Inherited Findings from Prerequisite Tasks:',
          options.priorTaskMemory.trim(),
          '',
        );
      }

      memoryLines.push(
        '## 📝 Working Findings, Decisions & Caveats:',
        '- Initialized worktree and reviewed task scope.',
        '',
        '## 📦 Exported Artifacts / Endpoints / Changes:',
        '(Document key interfaces, files edited, and test instructions for downstream tasks)',
        '',
      );

      memoryContent = memoryLines.join('\n');
      fs.writeFileSync(memoryPath, memoryContent, 'utf-8');
    }

    // 3. Manifest (.office/vfs/manifest.json)
    const manifest: VfsManifest = {
      schemaVersion: 1,
      taskId: options.task.id,
      role: options.task.role,
      generatedAt: Date.now(),
      availableFiles: options.availableFiles ?? [],
      contextSnippets: (options.contextSnippets ?? []).map((s) => s.path),
      skills: options.skills ?? [],
    };
    fs.writeFileSync(path.join(vfsRoot, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

    // 4. Context snippets (.office/vfs/context/*)
    if (options.contextSnippets && options.contextSnippets.length > 0) {
      for (let i = 0; i < options.contextSnippets.length; i++) {
        const snippet = options.contextSnippets[i];
        const safeBase = path.basename(snippet.path).replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${String(i + 1).padStart(2, '0')}-${safeBase}`;
        const header = snippet.description ? `// Context: ${snippet.description} (${snippet.path})\n\n` : '';
        fs.writeFileSync(path.join(contextDir, filename), `${header}${snippet.content}\n`, 'utf-8');
      }
    }

    return vfsRoot;
  }

  /**
   * Reads the memory.md findings from a completed worktree for chaining into downstream tasks.
   */
  public static readTaskMemory(worktreePath: string): string {
    const memoryPath = path.join(worktreePath, this.VFS_REL_PATH, 'memory.md');
    if (!fs.existsSync(memoryPath)) return '';
    try {
      return fs.readFileSync(memoryPath, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * Appends or updates the memory.md findings.
   */
  public static writeTaskMemory(worktreePath: string, content: string): boolean {
    const memoryPath = path.join(worktreePath, this.VFS_REL_PATH, 'memory.md');
    try {
      fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
      fs.writeFileSync(memoryPath, content, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  public static formatVfsBootInstructions(task?: VfsTaskSpec | string): string {
    const taskId = typeof task === 'string' ? task : task?.id;
    const taskHeader = taskId ? ` (Task ID: ${taskId})` : '';
    return [
      '',
      '---',
      `📁 SPATIAL VIRTUAL FILESYSTEM (VFS) MOUNTED IN .office/vfs/${taskHeader}:`,
      '- Assignment Spec: `cat .office/vfs/task.json`',
      '- Memory & Cognitive Scratchpad: `cat .office/vfs/memory.md` (Update this with findings before finishing)',
      '- Targeted Context Extracts: `ls .office/vfs/context/`',
      '- Manifest & Symbols: `cat .office/vfs/manifest.json`',
      '',
      '💡 TOKEN OPTIMIZATION DIRECTIVE: Inspect files on-demand using standard terminal commands (head, grep, cat). Do NOT load entire files into conversation. Commit your work cleanly to your branch before exiting.',
    ].join('\n');
  }
}
