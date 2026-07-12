import assert from "node:assert/strict";
import {
  TREE_SPECIES,
  createDraftFromSpecies,
  draftToTreePreset,
  getTreeSpecies,
  listTreeSpecies
} from "../src/domain/species-presets.js";

assert.ok(TREE_SPECIES.length >= 10);
assert.equal(listTreeSpecies().length, TREE_SPECIES.length);

for (const entry of TREE_SPECIES) {
  assert.equal(getTreeSpecies(entry.id).id, entry.id);
  const draft = createDraftFromSpecies(entry.id, 42);
  const preset = draftToTreePreset(draft);
  assert.equal(preset.species, entry.preset.species);
  assert.ok(preset.morphology.height > 0);
  assert.ok(preset.morphology.trunkRadius > 0);
  assert.ok(Array.isArray(preset.morphology.branchCounts));
}

const oakA = draftToTreePreset(createDraftFromSpecies("oak", 42));
const oakB = draftToTreePreset(createDraftFromSpecies("oak", 42));
assert.deepEqual(oakA, oakB);

console.log("species preset tests passed", {
  species: TREE_SPECIES.length
});
