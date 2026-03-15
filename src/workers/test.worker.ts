// Minimal test worker - no imports
console.log('[TEST WORKER] Script loaded!');

self.postMessage({ type: 'TEST', payload: 'Worker is alive!' });

self.onmessage = (e: MessageEvent) => {
  console.log('[TEST WORKER] Received message:', e.data);
  self.postMessage({ type: 'ECHO', payload: e.data });
};
