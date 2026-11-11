// Isolated admission-regression test against the REAL owned Worker class.
// No Cloudflare requests, real WebSockets, secrets, production accounts or network.
import assert from 'node:assert/strict';

const ResponseBase = globalThis.Response;
const originalPair = globalThis.WebSocketPair;
class UpgradeResponse extends ResponseBase {
  constructor(body, init = {}) {
    if (init.status === 101) {
      super(null, { status: 200 });
      this.testStatus = 101;
      this.webSocket = init.webSocket;
    } else {
      super(body, init);
    }
  }
  get status() { return this.testStatus ?? super.status; }
}
class TestSocket {
  readyState = 1;
  meta = {};
  serializeAttachment(value) { this.meta = structuredClone(value); }
  deserializeAttachment() { return this.meta; }
  send() {}
  close() { this.readyState = 3; }
}
class FakeWebSocketPair {
  constructor() { this[0] = new TestSocket(); this[1] = new TestSocket(); }
}

globalThis.Response = UpgradeResponse;
globalThis.WebSocketPair = FakeWebSocketPair;
try {
  const { World } = await import('../deploy/multiplayer-worker.js');
  const createWorld = () => {
    const sockets = [];
    const ctx = {
      getWebSockets: () => sockets,
      acceptWebSocket: s => sockets.push(s),
      storage: { getAlarm: async () => 1, setAlarm: async () => {} },
    };
    const request = {
      url: 'https://world.internal/ws',
      headers: new Headers({ upgrade: 'websocket' }),
    };
    return { world: new World(ctx, {}), sockets, request };
  };

  // Before hardening: 80 unverified sockets occupied every slot.
  // After hardening: a small fixed number of pending handshakes is allowed.
  {
    const { world, sockets, request } = createWorld();
    for (let i = 0; i < 8; i++) {
      assert.equal((await world.fetch(request)).status, 101);
    }
    const denied = await world.fetch(request);
    assert.equal(denied.status, 503);
    assert.equal(sockets.length, 8);
    assert.ok(sockets.every(s => !s.deserializeAttachment().id));
    console.log('PASS: unauthenticated pending connections have a bounded budget');
  }

  // An authenticated handshake frees a pending slot without using live accounts.
  {
    const { world, sockets, request } = createWorld();
    for (let i = 0; i < 8; i++) assert.equal((await world.fetch(request)).status, 101);
    sockets[0].serializeAttachment({ ...sockets[0].deserializeAttachment(), id: 'verified-player', ready: false });
    assert.equal((await world.fetch(request)).status, 101);
    assert.equal(sockets.length, 9);
    assert.equal((await world.fetch(request)).status, 503);
    sockets[1].close();
    assert.equal((await world.fetch(request)).status, 101);
    console.log('PASS: authenticated progression and closed sockets restore admission');
  }

  // Legitimate ready connections retain the original total limit of 80.
  {
    const { world, sockets, request } = createWorld();
    for (let i = 0; i < 80; i++) {
      assert.equal((await world.fetch(request)).status, 101);
      sockets.at(-1).serializeAttachment({
        ...sockets.at(-1).deserializeAttachment(),
        id: 'verified-' + i, ready: true,
      });
    }
    assert.equal(sockets.length, 80);
    assert.equal((await world.fetch(request)).status, 503);
    console.log('PASS: authenticated players still use all 80 capacity slots');
  }

  console.log('PASS: all tests used isolated in-memory fakes; deployment unverified');
} finally {
  globalThis.Response = ResponseBase;
  globalThis.WebSocketPair = originalPair;
}
