import fs from "node:fs";
import path from "node:path";

const root = "public";
const maxTotalBytes = 8 * 1024 * 1024;
const maxSingleAssetBytes = 1024 * 1024;
// The three authored, lazy-loaded 3D assets include actual character/fur and
// furnishing geometry. Keep their individual budget explicit; retain 1 MB for
// all other assets and the existing 8 MB total ceiling.
const modelBudgets = new Map([
  ["public/models/yor-operator.glb", 2.5 * 1024 * 1024],
  ["public/models/yor-husky.glb", 2.5 * 1024 * 1024],
  ["public/models/yor-night-study.glb", 2.5 * 1024 * 1024],
]);
const files = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const current = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(current);
    else if (entry.isFile()) files.push({ path: current, bytes: fs.statSync(current).size });
  }
}

collect(root);
const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
const largest = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 5);

console.log(`public asset total: ${(bytes / 1024).toFixed(1)} KB across ${files.length} files`);
console.log(`largest assets: ${largest.map((file) => `${file.path} ${(file.bytes / 1024).toFixed(1)} KB`).join(" | ")}`);

if (bytes > maxTotalBytes) throw new Error("Public assets exceed 8 MB review threshold");
for (const file of files) {
  const budget = modelBudgets.get(file.path.replaceAll(path.sep, "/")) ?? maxSingleAssetBytes;
  if (file.bytes > budget) throw new Error(`${file.path} exceeds its ${(budget / 1024 / 1024).toFixed(1)} MB per-asset review threshold`);
}
