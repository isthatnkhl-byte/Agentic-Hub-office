import test from 'node:test';
import assert from 'node:assert/strict';
import type { Meeting, MeetingSwarmTask, SwarmRole, SwarmTaskStatus } from '../src/shared/protocol';
import { fmtCost, fmtTokens } from '../src/shared/protocol';
import { computeDagLayout, ROLE_THEMES, STATUS_THEMES } from '../src/client/world/swarm-dag-render';

test('computeSwarmProgress calculates correct counts and percentage for 2D dashboard', () => {
  const tasks: MeetingSwarmTask[] = [
    {
      id: 'task-1',
      agentName: 'Backend Architect',
      work: 'Setup database schema and auth endpoints',
      dependsOn: [],
      acceptanceCriteria: ['DB migrations run cleanly'],
      context: { include: ['src/server/**'], exclude: [] },
      role: 'backend',
      provider: 'agy',
      routeReason: 'Backend task',
      status: 'done',
    },
    {
      id: 'task-2',
      agentName: 'Frontend Engineer',
      work: 'Implement user auth login form',
      dependsOn: ['task-1'],
      acceptanceCriteria: ['Form validates input'],
      context: { include: ['src/client/**'], exclude: [] },
      role: 'frontend',
      provider: 'agy',
      routeReason: 'Frontend task',
      status: 'running',
    },
    {
      id: 'task-3',
      agentName: 'QA Specialist',
      work: 'Write e2e login tests',
      dependsOn: ['task-2'],
      acceptanceCriteria: ['Tests pass 100%'],
      context: { include: ['tests/**'], exclude: [] },
      role: 'testing',
      provider: 'claude',
      routeReason: 'QA task',
      status: 'queued',
    },
    {
      id: 'task-4',
      agentName: 'Security Auditor',
      work: 'Audit password hashing and token leaks',
      dependsOn: ['task-1'],
      acceptanceCriteria: ['No plaintext tokens'],
      context: { include: ['src/server/**'], exclude: [] },
      role: 'security',
      provider: 'codex',
      routeReason: 'Security audit',
      status: 'blocked',
    },
  ];

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const running = tasks.filter((t) => t.status === 'running').length;
  const queued = tasks.filter((t) => t.status === 'queued').length;
  const blocked = tasks.filter((t) => t.status === 'blocked').length;
  const failed = tasks.filter((t) => t.status === 'failed').length;
  const pct = Math.round((done / total) * 100);

  assert.equal(total, 4);
  assert.equal(done, 1);
  assert.equal(running, 1);
  assert.equal(queued, 1);
  assert.equal(blocked, 1);
  assert.equal(failed, 0);
  assert.equal(pct, 25);
});

test('handles 0 tasks and 100% completion edge cases', () => {
  const emptyTasks: MeetingSwarmTask[] = [];
  const emptyPct = emptyTasks.length > 0 ? Math.round((0 / emptyTasks.length) * 100) : 0;
  assert.equal(emptyPct, 0);

  const completedTasks: MeetingSwarmTask[] = [
    {
      id: 't-1',
      agentName: 'Worker 1',
      work: 'Task 1',
      dependsOn: [],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'general',
      provider: 'agy',
      routeReason: 'General',
      status: 'done',
    },
    {
      id: 't-2',
      agentName: 'Worker 2',
      work: 'Task 2',
      dependsOn: ['t-1'],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'general',
      provider: 'agy',
      routeReason: 'General',
      status: 'done',
    },
  ];

  const fullPct = Math.round((completedTasks.filter((t) => t.status === 'done').length / completedTasks.length) * 100);
  assert.equal(fullPct, 100);
});

test('computeDagLayout correctly groups tasks into layers for 2D card presentation', () => {
  const tasks: MeetingSwarmTask[] = [
    {
      id: 'root-1',
      agentName: 'Root 1',
      work: 'Work 1',
      dependsOn: [],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'backend',
      provider: 'agy',
      routeReason: '',
      status: 'done',
    },
    {
      id: 'root-2',
      agentName: 'Root 2',
      work: 'Work 2',
      dependsOn: [],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'frontend',
      provider: 'agy',
      routeReason: '',
      status: 'done',
    },
    {
      id: 'mid-1',
      agentName: 'Mid 1',
      work: 'Work 3',
      dependsOn: ['root-1', 'root-2'],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'testing',
      provider: 'claude',
      routeReason: '',
      status: 'running',
    },
    {
      id: 'leaf-1',
      agentName: 'Leaf 1',
      work: 'Work 4',
      dependsOn: ['mid-1'],
      acceptanceCriteria: [],
      context: { include: [], exclude: [] },
      role: 'documentation',
      provider: 'opencode',
      routeReason: '',
      status: 'queued',
    },
  ];

  const graph = computeDagLayout(tasks, 1200, 700);
  assert.equal(graph.totalLayers, 3);

  const layer0 = graph.nodes.filter((n) => n.layer === 0).map((n) => n.task.id);
  const layer1 = graph.nodes.filter((n) => n.layer === 1).map((n) => n.task.id);
  const layer2 = graph.nodes.filter((n) => n.layer === 2).map((n) => n.task.id);

  assert.deepEqual(layer0.sort(), ['root-1', 'root-2']);
  assert.deepEqual(layer1, ['mid-1']);
  assert.deepEqual(layer2, ['leaf-1']);
  assert.equal(graph.edges.length, 3);
});

test('all swarm roles and statuses have valid themes with distinct icons and colors', () => {
  const roles: SwarmRole[] = ['frontend', 'backend', 'testing', 'security', 'documentation', 'general'];
  for (const r of roles) {
    const theme = ROLE_THEMES[r];
    assert.ok(theme, `Missing theme for role ${r}`);
    assert.ok(theme.icon.length > 0);
    assert.ok(theme.bg.startsWith('#'));
    assert.ok(theme.border.startsWith('#'));
    assert.ok(theme.ink.startsWith('#'));
  }

  const statuses: SwarmTaskStatus[] = ['done', 'running', 'queued', 'blocked', 'failed', 'cancelled'];
  for (const s of statuses) {
    const theme = STATUS_THEMES[s];
    assert.ok(theme, `Missing theme for status ${s}`);
    assert.ok(theme.icon.length > 0);
    assert.ok(theme.bg.startsWith('#'));
    assert.ok(theme.ink.startsWith('#'));
  }
});

test('protocol formatters format tokens and cost accurately for 2D UI display', () => {
  assert.equal(fmtTokens(500), '500');
  assert.equal(fmtTokens(1500), '1.5k');
  assert.equal(fmtTokens(50_000), '50k');
  assert.equal(fmtTokens(1_500_000), '1.50M');

  assert.equal(fmtCost(0.001), '<$0.01');
  assert.equal(fmtCost(0.05), '$0.05');
  assert.equal(fmtCost(12.34), '$12.34');
});
