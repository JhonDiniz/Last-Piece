// Tiny event bus used to decouple the game logic from the interface.
const map = new Map();
export function on(evt, fn) {
  if (!map.has(evt)) map.set(evt, new Set());
  map.get(evt).add(fn);
  return () => map.get(evt).delete(fn);
}
export function emit(evt, data) {
  const s = map.get(evt);
  if (s) for (const fn of [...s]) { try { fn(data); } catch (e) { console.error(e); } }
}
