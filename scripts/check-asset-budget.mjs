import fs from "node:fs";
import path from "node:path";

const root = "public/media";
const maxTotalBytes = 8 * 1024 * 1024;
const maxSingleAssetBytes = 1024 * 1024;
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

console.log(`local media total: ${(bytes / 1024).toFixed(1)} KB across ${files.length} files`);
console.log(`largest media: ${largest.map((file) => `${file.path} ${(file.bytes / 1024).toFixed(1)} KB`).join(" | ")}`);

if (bytes > maxTotalBytes) throw new Error("Local media exceeds 8 MB review threshold");
for (const file of files) {
  if (file.bytes > maxSingleAssetBytes) throw new Error(`${file.path} exceeds the 1 MB per-asset review threshold`);
}
