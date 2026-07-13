import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTreeObjectContractAdapterKit } from "../src/domain/tree-object-contract-adapter.js";

function validObject(id) {
  return {
    schema: "nexus-object-descriptor/1",
    id,
    objectType: "procedural-tree"
  };
}

const NexusEngine = {
  validateObjectDescriptor(value) {
    const errors = [];
    if (value?.schema !== "nexus-object-descriptor/1") errors.push("invalid schema");
    if (!String(value?.id ?? "").trim()) errors.push("missing id");
    return { valid: errors.length === 0, errors };
  },
  defineDomainServiceKit(config) {
    return {
      ...config,
      install(context) {
        context.engine.n ??= {};
        const api = config.createApi?.(context);
        if (api !== undefined) context.engine.n[config.apiName] = api;
        config.install?.(context);
      }
    };
  }
};

let conversionCount = 0;
const kit = createTreeObjectContractAdapterKit(NexusEngine, {
  cacheLimit: 8,
  createTreeObjectDescriptor(tree) {
    conversionCount += 1;
    return validObject(tree.id);
  }
});

const legacyDescriptors = new Map([
  ["oak-1", { schema: "nexus-tree-descriptor/1", id: "oak-1", hash: "aaa" }],
  ["pine-2", { schema: "nexus-tree-descriptor/1", id: "pine-2", hash: "bbb", objectDescriptor: validObject("pine-2") }]
]);
const source = {
  generate({ id }) { return structuredClone(legacyDescriptors.get(id)); },
  get(id) { return structuredClone(legacyDescriptors.get(id) ?? null); },
  list() { return Array.from(legacyDescriptors.values()).map((entry) => structuredClone(entry)); },
  getSnapshot() { return { version: "0.1.0", status: "ready", descriptors: this.list() }; },
  loadSnapshot(snapshot) {
    legacyDescriptors.clear();
    for (const descriptor of snapshot.descriptors ?? []) legacyDescriptors.set(descriptor.id, structuredClone(descriptor));
    return this.getSnapshot();
  },
  reset() {
    legacyDescriptors.clear();
    return this.getSnapshot();
  }
};
const engine = { n: { proceduralTree: source } };
kit.install({ engine });

const oak = engine.n.proceduralTree.generate({ id: "oak-1" });
assert.equal(oak.objectDescriptor.id, "oak-1");
assert.equal(conversionCount, 1, "missing object descriptor uses official converter once");

const oakAgain = engine.n.proceduralTree.generate({ id: "oak-1" });
assert.equal(oakAgain.objectDescriptor.id, "oak-1");
assert.equal(conversionCount, 1, "same tree descriptor reuses bounded compatibility cache");

const pine = engine.n.proceduralTree.generate({ id: "pine-2" });
assert.equal(pine.objectDescriptor.id, "pine-2");
assert.equal(conversionCount, 1, "valid object descriptor is preserved");

legacyDescriptors.set("bad-3", {
  schema: "nexus-tree-descriptor/1",
  id: "bad-3",
  hash: "ccc",
  objectDescriptor: validObject("wrong-id")
});
const repaired = engine.n.proceduralTree.get("bad-3");
assert.equal(repaired.objectDescriptor.id, "bad-3");
assert.equal(conversionCount, 2, "invalid object descriptor is regenerated");

const snapshot = engine.n.proceduralTree.getSnapshot();
assert.equal(snapshot.descriptors.every((entry) => entry.objectDescriptor?.id === entry.id), true);
assert.equal(engine.n.proceduralTree.getObjectDescriptor("oak-1").id, "oak-1");

const diagnostics = engine.n.treeObjectContractAdapter.getSnapshot();
assert.equal(diagnostics.conversions, 2);
assert.equal(diagnostics.cacheHits >= 1, true);
assert.equal(diagnostics.preserved >= 1, true);
assert.equal(diagnostics.cacheSize <= 8, true);
structuredClone(diagnostics);

assert.throws(
  () => engine.n.treeObjectContractAdapter.decorateTreeDescriptor({ schema: "wrong", id: "x" }),
  /nexus-tree-descriptor\/1/
);

engine.n.proceduralTree.reset();
assert.equal(engine.n.treeObjectContractAdapter.getSnapshot().conversions, 0);

const vendorSource = readFileSync(new URL("../src/vendor/nexus-kits.js", import.meta.url), "utf8");
assert.match(vendorSource, /createTreeObjectContractAdapterKit/);
assert.match(vendorSource, /\.\.\.treeModule\.createProceduralTreeKits/);
assert.doesNotMatch(vendorSource, /export const createProceduralTreeKits = treeModule\.createProceduralTreeKits/);

console.log("tree object contract adapter tests passed");
