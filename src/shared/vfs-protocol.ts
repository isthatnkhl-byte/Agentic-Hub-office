/**
 * Shared Virtual Filesystem (VFS) and Hierarchical Memory Protocol
 * Adapted from Bionic-GPT's "Everything is Context" VFS architecture.
 */

import type { SwarmRole } from './protocol.js';

export interface VfsTaskSpec {
  id: string;
  title: string;
  role: SwarmRole;
  work: string;
  acceptanceCriteria?: string[];
  boundedContextPaths?: string[];
  dependsOn?: string[];
  startedAt?: number;
}

export interface VfsContextSnippet {
  path: string;
  content: string;
  description?: string;
  symbol?: string;
}

export interface VfsManifest {
  schemaVersion: 1;
  taskId: string;
  role: SwarmRole;
  generatedAt: number;
  availableFiles: string[];
  contextSnippets: string[];
  skills: string[];
}

export interface VfsMemorySection {
  title: string;
  author: string;
  role: SwarmRole;
  timestamp: number;
  content: string;
}
