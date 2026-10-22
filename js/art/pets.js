// Companion portraits: chibi PNGs of the crew (assets/pets/<id>.png).
const cache = new Map();
export function petSVG(p) {
  let v = cache.get(p.id);
  if (!v) {
    v = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image href="assets/pets/${p.id}.png" x="7" y="0" width="50" height="64" preserveAspectRatio="xMidYMax meet"/></svg>`;
    cache.set(p.id, v);
  }
  return v;
}
