import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const javascript = [
  ...walk(path.join(root, "src")),
  ...walk(path.join(root, "scripts")),
  ...walk(path.join(root, "tests"))
].filter((file) => file.endsWith(".js") || file.endsWith(".mjs"));

for (const file of javascript) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const tests = spawnSync(process.execPath, ["tests/run-all.mjs"], {
  cwd: root,
  stdio: "inherit"
});
if (tests.status !== 0) process.exit(tests.status ?? 1);

const build = spawnSync(process.execPath, ["scripts/build.mjs"], {
  cwd: root,
  stdio: "inherit"
});
if (build.status !== 0) process.exit(build.status ?? 1);

for (const required of [
  "dist/index.html",
  "dist/styles.css",
  "dist/src/app.js",
  "dist/src/domain/tree-factory-domain-kit.js"
]) {
  if (!fs.existsSync(path.join(root, required))) {
    throw new Error(`Missing build output: ${required}`);
  }
}

console.log("TreeFactory checks passed", {
  javascriptFiles: javascript.length
});

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}
