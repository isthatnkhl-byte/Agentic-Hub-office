import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ComplexityGate } from '../src/shared/cost-optimizer.js';

test('ComplexityGate classifies questions and minor edits as single worker with high savings', () => {
  const questionResult = ComplexityGate.analyze('What is the current architecture of the backend?');
  assert.equal(questionResult.recommendedMode, 'single');
  assert.ok(questionResult.score <= 3);
  assert.ok(questionResult.tokenProjection.estimatedSavingsPercent >= 80);
  assert.equal(questionResult.isQuestion, true);

  const typoResult = ComplexityGate.analyze('Fix typo in header text');
  assert.equal(typoResult.recommendedMode, 'single');
  assert.ok(typoResult.score <= 3);
  assert.ok(typoResult.tokenProjection.estimatedSavingsPercent >= 80);
  assert.equal(typoResult.isMinorEdit, true);

  const cssResult = ComplexityGate.analyze('Change button background color to green in style.css');
  assert.equal(cssResult.recommendedMode, 'single');
  assert.ok(cssResult.score <= 3);
});

test('ComplexityGate classifies multi-domain refactors as swarm justified', () => {
  const prompt = `Refactor the entire authentication system across backend, database, and frontend UI:
  1. Migrate users table schema in PostgreSQL
  2. Implement OAuth2 and JWT token rotation in src/server/auth
  3. Redesign login and register modals in frontend client
  4. Write integration tests and migrate existing user passwords`;

  const result = ComplexityGate.analyze(prompt);
  assert.equal(result.recommendedMode, 'swarm');
  assert.ok(result.score >= 6, `Expected score >= 6, got ${result.score}`);
  assert.ok(result.reasoning.some((r) => r.includes('Cross-domain coordination')));
  assert.ok(result.tokenProjection.swarmTokens > result.tokenProjection.singleWorkerTokens);
});

test('ComplexityGate formatCostAdvisory produces formatted advisory strings', () => {
  const singleAnalysis = ComplexityGate.analyze('Explain how the queue works');
  const singleAdvisory = ComplexityGate.formatCostAdvisory(singleAnalysis);
  assert.ok(singleAdvisory.includes('Cost Advisory:'));
  assert.ok(singleAdvisory.includes('single worker'));

  const swarmAnalysis = ComplexityGate.analyze('Refactor auth, migrate db schema, update frontend ui, add redis caching');
  const swarmAdvisory = ComplexityGate.formatCostAdvisory(swarmAnalysis);
  assert.ok(swarmAdvisory.includes('Swarm Justified'));
});
