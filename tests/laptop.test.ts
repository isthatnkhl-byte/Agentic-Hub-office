import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { Laptop, paintScreen, type ScreenState } from '../src/client/world/laptop.js';

function withMockDocument(t: TestContext) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const mockDoc = {
    fonts: { ready: Promise.resolve() },
    createElement(tag: string) {
      if (tag === 'canvas') {
        return {
          width: 1024,
          height: 680,
          getContext: () => ({
            measureText: (text: string) => ({ width: text.length * 10 }),
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

test('paintScreen renders placeholder text when no screen state is provided', () => {
  let filledText = '';
  const mockCtx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect() {},
    fillText(text: string) {
      filledText = text;
    },
  } as unknown as CanvasRenderingContext2D;

  paintScreen(mockCtx, 800, 600, undefined, 'initializing agent...');
  assert.equal(filledText, 'initializing agent...');
});

test('paintScreen renders alert banner and warning border when alertMessage is specified', () => {
  const calls: string[] = [];
  const mockCtx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect() {
      calls.push('fillRect');
    },
    strokeRect() {
      calls.push('strokeRect');
    },
    fillText(text: string) {
      calls.push(`fillText:${text}`);
    },
  } as unknown as CanvasRenderingContext2D;

  paintScreen(mockCtx, 800, 600, undefined, 'ready', 0, 'Approval Required');
  assert.ok(calls.includes('fillText:⚠️ APPROVAL REQUIRED'), 'Should draw uppercase alert banner message');
  assert.ok(calls.includes('strokeRect'), 'Should draw attention border');
});

test('Laptop opens and shuts lid smoothly with easing', (t) => {
  withMockDocument(t);
  const laptop = new Laptop();

  // Initially closed
  assert.ok(laptop.root.children.length > 0);

  // Update opens the lid
  laptop.update(1.0, undefined, 2);

  // Shutting lid folds it down
  const closed = laptop.shut(2.0);
  assert.equal(closed, true, 'Lid should report closed after sufficient duration');

  laptop.dispose();
});

test('Laptop setAlert updates internal alert state and triggers redraw', (t) => {
  withMockDocument(t);
  const laptop = new Laptop();

  laptop.setAlert('Action Required');
  laptop.setPlaceholder('Worker 1');

  // Next update should paint without throwing
  laptop.update(0.1, undefined, 1);

  // Clearing alert resets state
  laptop.setAlert(null);
  laptop.update(0.1, undefined, 1);

  laptop.dispose();
});
