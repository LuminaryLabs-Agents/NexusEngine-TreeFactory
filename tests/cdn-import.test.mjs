import assert from "node:assert/strict";
import {
  githubCdnCandidates,
  importWithFallback
} from "../src/vendor/cdn-import.js";

const candidates = githubCdnCandidates({
  owner: "Org",
  repository: "Repo",
  commit: "abc",
  path: "/src/index.js"
});
assert.deepEqual(candidates, [
  "https://cdn.jsdelivr.net/gh/Org/Repo@abc/src/index.js",
  "https://fastly.jsdelivr.net/gh/Org/Repo@abc/src/index.js"
]);

const deterministicAttempts = [];
await assert.rejects(
  importWithFallback("runtime", candidates, {
    importer: async (url) => {
      deterministicAttempts.push(url);
      throw new TypeError("module import failed");
    },
    probe: async () => ({
      status: 404,
      url: "https://cdn.jsdelivr.net/missing.js"
    })
  }),
  /Equivalent CDN retries were stopped/
);
assert.deepEqual(deterministicAttempts, [candidates[0]]);

const transientAttempts = [];
const recovered = await importWithFallback("runtime", candidates, {
  importer: async (url) => {
    transientAttempts.push(url);
    if (url === candidates[0]) throw new TypeError("temporary failure");
    return { recovered: true };
  },
  probe: async () => null
});
assert.deepEqual(recovered, { recovered: true });
assert.deepEqual(transientAttempts, candidates);

console.log("cdn import fallback ok");
