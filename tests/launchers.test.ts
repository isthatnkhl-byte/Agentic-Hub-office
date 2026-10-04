import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

test('bin/agent-office.js exists and has valid node shebang and import target', () => {
  const binPath = path.join(ROOT, 'bin', 'agent-office.js');
  assert.ok(fs.existsSync(binPath), 'bin/agent-office.js must exist');

  const content = fs.readFileSync(binPath, 'utf8');
  assert.ok(content.startsWith('#!/usr/bin/env node'), 'must start with node shebang');
  assert.ok(content.includes('../dist/server/server/cli.js'), 'must import compiled cli.js');
});

test('package.json registers agentic-hub and agent-office bin commands', () => {
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert.equal(pkg.bin['agentic-hub'], 'bin/agent-office.js');
  assert.equal(pkg.bin['agent-office'], 'bin/agent-office.js');
  assert.ok(pkg.files.includes('bin'));
  assert.ok(pkg.files.includes('dist'));
});

test('AgenticHub-Launcher.bat exists and configures port, password and app launch', () => {
  const batPath = path.join(ROOT, 'AgenticHub-Launcher.bat');
  assert.ok(fs.existsSync(batPath), 'AgenticHub-Launcher.bat must exist in repo root');

  const content = fs.readFileSync(batPath, 'utf8');
  assert.ok(content.includes('where node'), 'must check for node in path');
  assert.ok(content.includes('PORT=4600'), 'must default port to 4600');
  assert.ok(content.includes('PASSWORD=dev'), 'must default password to dev');
  assert.ok(content.includes('bin/agent-office.js'), 'must run agent-office.js');
  assert.ok(content.includes('--app='), 'must open browser in app mode');
});

test('AgenticHub-Share-Multiplayer.bat exists and launches with --share flag', () => {
  const batPath = path.join(ROOT, 'AgenticHub-Share-Multiplayer.bat');
  assert.ok(fs.existsSync(batPath), 'AgenticHub-Share-Multiplayer.bat must exist in repo root');

  const content = fs.readFileSync(batPath, 'utf8');
  assert.ok(content.includes('--share'), 'must invoke server with --share flag');
  assert.ok(content.includes('4600'), 'must target port 4600');
});

test('scripts/install-windows.ps1 exists and targets shortcuts and build', () => {
  const ps1Path = path.join(ROOT, 'scripts', 'install-windows.ps1');
  assert.ok(fs.existsSync(ps1Path), 'scripts/install-windows.ps1 must exist');

  const content = fs.readFileSync(ps1Path, 'utf8');
  assert.ok(content.includes('AgenticHub-Launcher.bat'), 'must reference AgenticHub-Launcher.bat');
  assert.ok(content.includes('CreateShortcut'), 'must create desktop/start menu shortcuts');
});

test('scripts/install-unix.sh exists and configures agentic-hub binary in user bin', () => {
  const shPath = path.join(ROOT, 'scripts', 'install-unix.sh');
  assert.ok(fs.existsSync(shPath), 'scripts/install-unix.sh must exist');

  const content = fs.readFileSync(shPath, 'utf8');
  assert.ok(content.includes('#!/usr/bin/env bash'), 'must have bash shebang');
  assert.ok(content.includes('agent-office.js'), 'must invoke agent-office.js');
});
