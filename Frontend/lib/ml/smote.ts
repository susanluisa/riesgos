// lib/ml/smote.ts — SMOTE ligero en TS (binario y multiclase)

function euclidean(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}
function kNearestMinority(minority: number[][], k: number) {
  const neighbors: number[][] = [];
  for (let i = 0; i < minority.length; i++) {
    const dists = minority.map((m, j) => ({ j, d: i === j ? Infinity : euclidean(minority[i], m) }));
    dists.sort((a, b) => a.d - b.d);
    neighbors.push(dists.slice(0, Math.min(k, Math.max(1, minority.length - 1))).map(x => x.j));
  }
  return neighbors;
}
function synthSample(a: number[], b: number[]) {
  const lam = Math.random();
  return a.map((v, i) => v + lam * ((b[i] ?? 0) - v));
}
export function smoteBinary(X: number[][], y: number[], k = 5) {
  const labels = Array.from(new Set(y));
  if (labels.length !== 2) return { X, y };
  const [c0, c1] = labels;
  const idx0 = y.reduce((acc, v, i) => (v === c0 ? (acc.push(i), acc) : acc), [] as number[]);
  const idx1 = y.reduce((acc, v, i) => (v === c1 ? (acc.push(i), acc) : acc), [] as number[]);
  const n0 = idx0.length, n1 = idx1.length;
  if (n0 === 0 || n1 === 0) return { X, y };
  const minority = n0 >= n1 ? c1 : c0;
  const minorityIdx = minority === c0 ? idx0 : idx1;
  const deficit = Math.max(n0, n1) - Math.min(n0, n1);
  if (deficit <= 0) return { X, y };

  const minor = minorityIdx.map(i => X[i]);
  const Xnew = X.slice(), ynew = y.slice();
  if (minor.length < 2) {
    for (let t = 0; t < deficit; t++) {
      const pick = minorityIdx[Math.floor(Math.random() * minorityIdx.length)];
      Xnew.push([...X[pick]]); ynew.push(minority);
    }
    return { X: Xnew, y: ynew };
  }
  const neigh = kNearestMinority(minor, Math.min(k, Math.max(1, minor.length - 1)));
  for (let t = 0; t < deficit; t++) {
    const i = Math.floor(Math.random() * minor.length);
    const j = neigh[i][Math.floor(Math.random() * neigh[i].length)];
    Xnew.push(synthSample(minor[i], minor[j])); ynew.push(minority);
  }
  return { X: Xnew, y: ynew };
}
export function smoteMulticlass(X: number[][], y: number[], k = 5) {
  const labels = Array.from(new Set(y));
  if (labels.length <= 2) return smoteBinary(X, y, k);
  const counts = new Map<number, number>();
  y.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
  const maxCount = Math.max(...Array.from(counts.values()));
  let Xc = X.slice(), yc = y.slice();
  for (const label of labels) {
    const idx = yc.reduce((acc, v, i) => (v === label ? (acc.push(i), acc) : acc), [] as number[]);
    const deficit = maxCount - idx.length;
    if (deficit <= 0) continue;
    const minor = idx.map(i => Xc[i]);
    if (minor.length < 2) {
      for (let t = 0; t < deficit; t++) {
        const pick = idx[Math.floor(Math.random() * idx.length)];
        Xc.push([...Xc[pick]]); yc.push(label);
      }
      continue;
    }
    const neigh = kNearestMinority(minor, Math.min(k, Math.max(1, minor.length - 1)));
    for (let t = 0; t < deficit; t++) {
      const i = Math.floor(Math.random() * minor.length);
      const j = neigh[i][Math.floor(Math.random() * neigh[i].length)];
      Xc.push(synthSample(minor[i], minor[j])); yc.push(label);
    }
  }
  return { X: Xc, y: yc };
}
