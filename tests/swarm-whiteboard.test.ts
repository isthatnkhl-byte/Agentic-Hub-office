import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDagLayout, ROLE_THEMES, STATUS_THEMES } from '../src/client/world/swarm-dag-render.js';
import type { MeetingSwarmTask, SwarmRole, SwarmTaskStatus } from '../src/shared/protocol.js';

function fixtureTask(id: string, agentName: string, role: SwarmRole, status: SwarmTaskStatus, dependsOn: string[] = []): MeetingSwarmTask {
  return {
    id,
    agentName,
    work: `Execute task ${id}`,
    dependsOn,
    acceptanceCriteria: ['Tests pass'],
    context: { include: [], exclude: [] },
    role,
    provider: 'antigravity',
    routeReason: 'Auto-assigned',
    status,
  };
}

test('computeDagLayout places root tasks in layer 0', () => {
  const tasks: MeetingSwarmTask[] = [
    fixtureTask('task-1', 'Backend Schema', 'backend', 'done', []),
    fixtureTask('task-2', 'Frontend Shell', 'frontend', 'running', []),
  ];

  const layout = computeDagLayout(tasks, 1200, 600);
  assert.equal(layout.totalLayers, 1);
  assert.equal(layout.nodes.length, 2);
  assert.equal(layout.nodes[0].layer, 0);
  assert.equal(layout.nodes[1].layer, 0);
  assert.equal(layout.edges.length, 0);
});

test('computeDagLayout layers dependent tasks downstream and generates directed edges', () => {
  const tasks: MeetingSwarmTask[] = [
    fixtureTask('task-1', 'Database Schema', 'backend', 'done', []),
    fixtureTask('task-2', 'API Routes', 'backend', 'done', ['task-1']),
    fixtureTask('task-3', 'Frontend Views', 'frontend', 'running', ['task-2']),
    fixtureTask('task-4', 'E2E Testing', 'testing', 'queued', ['task-2', 'task-3']),
  ];

  const layout = computeDagLayout(tasks, 1200, 600);
  assert.equal(layout.totalLayers, 4);

  const nodeMap = new Map(layout.nodes.map((n) => [n.task.id, n]));
  assert.equal(nodeMap.get('task-1')?.layer, 0);
  assert.equal(nodeMap.get('task-2')?.layer, 1);
  assert.equal(nodeMap.get('task-3')?.layer, 2);
  assert.equal(nodeMap.get('task-4')?.layer, 3);

  // Check that edges connect correctly
  assert.equal(layout.edges.length, 4);
  const edgeT1ToT2 = layout.edges.find((e) => e.fromTask === 'task-1' && e.toTask === 'task-2');
  assert.ok(edgeT1ToT2, 'Edge task-1 -> task-2 should exist');
  assert.ok(edgeT1ToT2.fromX < edgeT1ToT2.toX, 'fromX must be to the left of toX');
});

test('computeDagLayout handles empty task list gracefully', () => {
  const layout = computeDagLayout([], 1200, 600);
  assert.equal(layout.nodes.length, 0);
  assert.equal(layout.edges.length, 0);
  assert.equal(layout.totalLayers, 0);
});

test('computeDagLayout tolerates unexpected cycles without infinite recursion', () => {
  const cyclicTasks: MeetingSwarmTask[] = [
    fixtureTask('task-a', 'Task A', 'backend', 'running', ['task-b']),
    fixtureTask('task-b', 'Task B', 'frontend', 'running', ['task-a']),
  ];

  const layout = computeDagLayout(cyclicTasks, 1200, 600);
  assert.equal(layout.nodes.length, 2);
  assert.ok(layout.totalLayers >= 1);
});

test('all SwarmRole and SwarmTaskStatus values have complete visual theme definitions', () => {
  const roles: SwarmRole[] = ['frontend', 'backend', 'testing', 'security', 'documentation', 'general'];
  for (const role of roles) {
    const theme = ROLE_THEMES[role];
    assert.ok(theme, `ROLE_THEMES missing role: ${role}`);
    assert.ok(theme.label, `Role theme missing label: ${role}`);
    assert.ok(theme.icon, `Role theme missing icon: ${role}`);
    assert.ok(theme.bg.startsWith('#'), `Role theme bg should be hex color: ${theme.bg}`);
    assert.ok(theme.ink.startsWith('#'), `Role theme ink should be hex color: ${theme.ink}`);
  }

  const statuses: SwarmTaskStatus[] = ['queued', 'running', 'done', 'failed', 'blocked', 'cancelled'];
  for (const status of statuses) {
    const theme = STATUS_THEMES[status];
    assert.ok(theme, `STATUS_THEMES missing status: ${status}`);
    assert.ok(theme.label, `Status theme missing label: ${status}`);
    assert.ok(theme.icon, `Status theme missing icon: ${status}`);
  }
});
