import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { buildDeskSigns, type WorkerDeskBadge } from '../src/client/world/desksigns.js';
import type { DeskLabel } from '../src/shared/floorplan.js';
import { DESKS } from '../src/shared/layout.js';

function withMockDocument(t: TestContext) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const mockDoc = {
    fonts: { ready: Promise.resolve() },
    createElement(tag: string) {
      if (tag === 'canvas') {
        return {
          width: 1024,
          height: 334,
          getContext: () => ({
            measureText: (text: string) => ({ width: text.length * 12 }),
            fillRect() {},
            strokeRect() {},
            fillText() {},
            beginPath() {},
            roundRect() {},
            stroke() {},
            fill() {},
            createLinearGradient: () => ({ addColorStop() {} }),
          }),
        };
      }
      return {};
    },
  };
  Object.defineProperty(globalThis, 'document', { configurable: true, value: mockDoc });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  });
}

test('buildDeskSigns hangs signs for configured floorplan labels', (t) => {
  withMockDocument(t);
  const signs = buildDeskSigns();
  const testDeskId = DESKS[0].id;

  const baseLabels: Record<string, DeskLabel> = {
    [testDeskId]: { text: 'Backend Engineering', color: '#ffd6e0' },
  };

  signs.set(baseLabels, () => true);
  const signObj = signs.get(testDeskId);
  assert.ok(signObj, 'Desk sign should exist for labeled desk');
  assert.equal(signObj.visible, true);
});

test('setWorkers overrides desk sign with role and status badge', (t) => {
  withMockDocument(t);
  const signs = buildDeskSigns();
  const testDeskId = DESKS[0].id;

  signs.set({ [testDeskId]: { text: 'General Desk', color: '#ffffff' } }, () => true);

  const workers: Record<string, WorkerDeskBadge> = {
    [testDeskId]: {
      name: 'Ada',
      role: 'Backend Architect',
      status: 'working',
      color: '#e7f5ff',
    },
  };

  signs.setWorkers(workers, () => true);
  const signObj = signs.get(testDeskId);
  assert.ok(signObj, 'Sign should still exist after worker assignment');
});

test('desk turnover: removing worker restores base floorplan label', (t) => {
  withMockDocument(t);
  const signs = buildDeskSigns();
  const testDeskId = DESKS[0].id;

  const baseLabels: Record<string, DeskLabel> = {
    [testDeskId]: { text: 'Platform Infrastructure', color: '#caffbf' },
  };

  signs.set(baseLabels, () => true);

  // Worker sits down
  signs.setWorkers(
    {
      [testDeskId]: {
        name: 'Bo',
        role: 'Swarm Worker',
        status: 'working',
      },
    },
    () => true,
  );

  // Worker completes task and vacates desk (desk turnover)
  signs.setWorkers({}, () => true);

  const signObj = signs.get(testDeskId);
  assert.ok(signObj, 'Sign should revert to base label after worker departure');
});
