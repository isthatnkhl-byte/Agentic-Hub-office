import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { VfsManager } from '../src/server/vfs/vfs-manager.js';
import type { VfsTaskSpec } from '../src/shared/vfs-protocol.js';

function scratch(t: { after(fn: () => void): void }) {
  const dir = mkdtempSync(path.join(tmpdir(), 'office-vfs-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test('VfsManager mounts .office/vfs layout, task.json and memory.md', (t) => {
  const worktreeDir = scratch(t);
  const task: VfsTaskSpec = {
    id: 't-123',
    title: 'Migrate DB to Postgres',
    role: 'backend',
    work: 'Setup connection pooling and migrations',
    acceptanceCriteria: ['Connection pool configured', 'Tests pass'],
    boundedContextPaths: ['src/db/', 'config/database.json'],
    dependsOn: ['t-100'],
    startedAt: 1700000000000,
  };

  const manifest = VfsManager.mount({
    worktreePath: worktreeDir,
    task,
    priorTaskMemory: '## Prior Task: t-100\nCreated schema tables successfully.',
    availableFiles: ['src/db/pool.ts', 'config/database.json'],
  });

  // Verify paths
  const vfsRoot = path.join(worktreeDir, '.office', 'vfs');
  const taskJsonPath = path.join(vfsRoot, 'task.json');
  const memoryMdPath = path.join(vfsRoot, 'memory.md');
  const contextDir = path.join(vfsRoot, 'context');

  assert.ok(existsSync(taskJsonPath), 'task.json must exist');
  assert.ok(existsSync(memoryMdPath), 'memory.md must exist');
  assert.ok(existsSync(contextDir), 'context directory must exist');

  // Verify task.json contents
  const parsedTask = JSON.parse(readFileSync(taskJsonPath, 'utf8'));
  assert.equal(parsedTask.id, 't-123');
  assert.equal(parsedTask.role, 'backend');
  assert.deepEqual(parsedTask.boundedContextPaths, ['src/db/', 'config/database.json']);

  // Verify memory.md contents include prior task cognitive memory
  const memoryContent = readFileSync(memoryMdPath, 'utf8');
  assert.ok(memoryContent.includes('Migrate DB to Postgres'));
  assert.ok(memoryContent.includes('Created schema tables successfully.'));

  // Verify manifest
  const manifestJson = JSON.parse(readFileSync(path.join(vfsRoot, 'manifest.json'), 'utf8'));
  assert.equal(manifestJson.taskId, 't-123');
  assert.equal(manifestJson.availableFiles.length, 2);
});

test('VfsManager readTaskMemory and writeTaskMemory', (t) => {
  const worktreeDir = scratch(t);
  const task: VfsTaskSpec = {
    id: 't-auth',
    title: 'Auth Service',
    role: 'backend',
    work: 'Implement JWT authentication',
  };

  VfsManager.mount({
    worktreePath: worktreeDir,
    task,
  });

  const updatedMemory = `# Auth Service Task Memory

## Decisions
- Used RS256 for JWT signing
- Token expiry set to 15 minutes

## Discoveries
- Auth middleware must be mounted before route handlers

## Completed Changes
- Created auth.ts with verifyToken middleware
`;

  VfsManager.writeTaskMemory(worktreeDir, updatedMemory);
  const readBack = VfsManager.readTaskMemory(worktreeDir);
  assert.equal(readBack, updatedMemory);
});

test('VfsManager formatVfsBootInstructions generates clear directives for worker agents', () => {
  const instructions = VfsManager.formatVfsBootInstructions('t-999');
  assert.ok(instructions.includes('.office/vfs/task.json'));
  assert.ok(instructions.includes('.office/vfs/memory.md'));
  assert.ok(instructions.includes('t-999'));
});
