import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SWARM_SQUAD_PRESETS,
  SWARM_SQUAD_BY_ID,
  getSwarmSquad,
  buildSquadMasterPrompt,
  SWARM_ROLES,
  type SwarmSquadPreset,
} from '../src/shared/meetings.js';

test('SWARM_SQUAD_PRESETS defines all 5 required curated squad presets', () => {
  assert.equal(SWARM_SQUAD_PRESETS.length, 5);
  const ids = SWARM_SQUAD_PRESETS.map((p) => p.id);
  assert.deepEqual(ids, ['fullstack', 'security', 'performance', 'antigravity', 'devex']);
});

test('every swarm squad preset has valid structure, icons, and non-empty metadata', () => {
  for (const preset of SWARM_SQUAD_PRESETS) {
    assert.ok(preset.id.length > 0, `Preset must have id`);
    assert.ok(preset.name.length > 0, `Preset ${preset.id} must have name`);
    assert.ok(preset.icon.length > 0, `Preset ${preset.id} must have icon`);
    assert.ok(preset.tagline.length > 0, `Preset ${preset.id} must have tagline`);
    assert.ok(preset.description.length > 0, `Preset ${preset.id} must have description`);
    assert.ok(preset.defaultMasterPrompt.length > 0, `Preset ${preset.id} must have defaultMasterPrompt`);
    assert.ok(Array.isArray(preset.squad), `Preset ${preset.id} must have squad members array`);
    assert.ok(preset.squad.length >= 3, `Preset ${preset.id} must have at least 3 members`);

    for (const member of preset.squad) {
      assert.ok(member.agentName.length > 0, `Member in ${preset.id} must have agentName`);
      assert.ok(SWARM_ROLES.includes(member.role), `Member role '${member.role}' in ${preset.id} must be valid SwarmRole`);
      assert.ok(member.focus.length > 0, `Member in ${preset.id} must have focus description`);
    }
  }
});

test('SWARM_SQUAD_BY_ID and getSwarmSquad lookup presets accurately', () => {
  const fullstack = getSwarmSquad('fullstack');
  assert.ok(fullstack);
  assert.equal(fullstack?.id, 'fullstack');
  assert.equal(fullstack?.name, 'Full-Stack Feature Squad');

  const antigravity = getSwarmSquad('antigravity');
  assert.ok(antigravity);
  assert.equal(antigravity?.id, 'antigravity');
  assert.equal(antigravity?.icon, '🪐');

  assert.equal(getSwarmSquad('non-existent'), undefined);
});

test('antigravity squad preset explicitly configures Google Antigravity (agy) provider', () => {
  const agySquad = getSwarmSquad('antigravity');
  assert.ok(agySquad);
  assert.equal(agySquad.squad.length, 3);
  for (const member of agySquad.squad) {
    assert.equal(member.provider, 'agy', `Member ${member.agentName} must have agy provider`);
  }
});

test('buildSquadMasterPrompt generates complete planner directives with custom and default objectives', () => {
  const security = getSwarmSquad('security')!;
  
  // Default objective
  const defaultPrompt = buildSquadMasterPrompt(security);
  assert.ok(defaultPrompt.includes('# Target Objective: Security & Hardening Swarm'));
  assert.ok(defaultPrompt.includes('Conduct an end-to-end security audit'));
  assert.ok(defaultPrompt.includes('Security Auditor'));
  assert.ok(defaultPrompt.includes('Defensive Systems Engineer'));
  assert.ok(defaultPrompt.includes('Exploit Regression Tester'));
  assert.ok(defaultPrompt.includes('Planner Directive: Structure plan.json'));

  // Custom objective override
  const customObjective = 'Harden the authentication token exchange endpoints and verify brute-force resistance';
  const customPrompt = buildSquadMasterPrompt(security, customObjective);
  assert.ok(customPrompt.includes(customObjective));
  assert.ok(!customPrompt.includes(security.defaultMasterPrompt));
  assert.ok(customPrompt.includes('## Recommended Autonomous Squad Composition:'));
});
