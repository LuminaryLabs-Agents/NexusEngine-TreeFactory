import { spawnSync } from "node:child_process";

const tests = [
  "tests/species-presets.test.mjs",
  "tests/tree-factory-state.test.mjs",
  "tests/capture-plan.test.mjs"
];

for (const test of tests) {
  const result = spawnSync(process.execPath, [test], {
    cwd: process.cwd(),
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Passed ${tests.length} TreeFactory tests.`);
