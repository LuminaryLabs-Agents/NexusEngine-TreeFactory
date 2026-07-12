import assert from "node:assert/strict";
import {
  createTreeFactoryBuildRequest,
  createTreeFactoryState,
  patchTreeFactoryDraft,
  recordTreeFactoryExport,
  recordTreeFactoryGeneration,
  selectTreeFactorySpecies,
  validateTreeFactoryState
} from "../src/domain/tree-factory-state.js";

let state = createTreeFactoryState({
  initialSpeciesId: "oak",
  seed: 1737
});

assert.equal(validateTreeFactoryState(state).valid, true);
assert.equal(state.selectedSpeciesId, "oak");

state = selectTreeFactorySpecies(state, "pine");
assert.equal(state.selectedSpeciesId, "pine");
assert.equal(state.draft.speciesId, "pine");

state = patchTreeFactoryDraft(state, {
  morphology: { height: 23 },
  capture: { azimuthCount: 12 }
});

const request = createTreeFactoryBuildRequest(state);
assert.equal(request.tree.preset.morphology.height, 23);
assert.equal(request.capture.views.azimuthCount, 12);
assert.equal(request.capture.views.azimuthCount * request.capture.views.elevations.length, 24);
assert.ok(request.capture.atlas.columns * request.capture.atlas.rows >= 24);

state = recordTreeFactoryGeneration(state, {
  id: request.id,
  objectHash: "object-hash",
  treeHash: "tree-hash",
  branches: 100,
  leaves: 300,
  buildMilliseconds: 24
});
assert.equal(state.generationLedger.length, 1);

state = recordTreeFactoryExport(state, {
  objectId: request.id,
  format: "glb"
});
assert.equal(state.exportLedger.length, 1);
assert.equal(validateTreeFactoryState(state).valid, true);

console.log("tree factory state tests passed");
