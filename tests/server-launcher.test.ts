import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { loadConfig } from '../src/server/config.js';
import { startServer } from '../src/server/server.js';

test('bin/agent-office.js launcher exists and points to compiled cli.js', () => {
  const launcherPath = path.resolve('bin', 'agent-office.js');
  assert.ok(fs.existsSync(launcherPath), 'bin/agent-office.js should exist');

  const content = fs.readFileSync(launcherPath, 'utf8');
  assert.ok(content.startsWith('#!/usr/bin/env node'), 'Should have node hashbang');
  assert.ok(content.includes('dist/server/server/cli.js'), 'Should import compiled server cli');
});

test('loadConfig parses command line flags for server startup', () => {
  const tempDir = fs.mkdtempSync(path.join(path.resolve('.'), 'scratch-config-'));
  try {
    const args = [
      tempDir,
      '--port', '4789',
      '--host', '127.0.0.1',
      '--password', 'test-secret-123',
      '--no-open',
      '--max-workers', '8',
    ];
    const cfg = loadConfig(args);
    assert.equal(cfg.port, 4789);
    assert.equal(cfg.host, '127.0.0.1');
    assert.equal(cfg.password, 'test-secret-123');
    assert.equal(cfg.open, false);
    assert.equal(cfg.maxWorkers, 8);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

async function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = http.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      srv.close((err) => (err ? reject(err) : resolve(port)));
    });
    srv.on('error', reject);
  });
}

test('startServer starts an HTTP/WebSocket server and handles requests', async () => {
  const tempDir = fs.mkdtempSync(path.join(path.resolve('.'), 'scratch-server-'));
  let serverInstance: Awaited<ReturnType<typeof startServer>> | null = null;
  try {
    const testPort = await getAvailablePort();
    const cfg = loadConfig([
      tempDir,
      '--port', String(testPort),
      '--host', '127.0.0.1',
      '--password', 'dev-pass',
      '--no-open',
    ]);

    serverInstance = await startServer(cfg);
    assert.ok(serverInstance, 'startServer should return server instance');

    // Make an HTTP GET request to verify server responds
    const response = await new Promise<{ statusCode?: number }>((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${testPort}`, (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', reject);
    });

    assert.equal(response.statusCode, 200);
  } finally {
    if (serverInstance) {
      await serverInstance.shutdown();
    }
    try {
      fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {
      // Non-fatal if Windows takes extra time releasing file handles
    }
  }
});
