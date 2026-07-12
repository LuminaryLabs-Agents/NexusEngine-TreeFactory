import {
  createDraftFromSpecies,
  draftToTreePreset,
  getTreeSpecies,
  listTreeSpecies
} from "./species-presets.js";

const clone = (value) => structuredClone(value);

export function createTreeFactoryState(config = {}) {
  const species = listTreeSpecies();
  const initialSpeciesId = config.initialSpeciesId ?? species[0].id;
  return {
    schema: "nexus-tree-factory-state/1",
    version: "0.1.0",
    selectedSpeciesId: initialSpeciesId,
    draft: createDraftFromSpecies(initialSpeciesId, config.seed ?? 1737),
    generationLedger: [],
    exportLedger: [],
    revision: 0
  };
}

export function selectTreeFactorySpecies(state, speciesId) {
  getTreeSpecies(speciesId);
  return {
    ...clone(state),
    selectedSpeciesId: speciesId,
    draft: createDraftFromSpecies(speciesId, state.draft.seed),
    revision: state.revision + 1
  };
}

export function patchTreeFactoryDraft(state, patch = {}) {
  return {
    ...clone(state),
    draft: deepMerge(state.draft, patch),
    revision: state.revision + 1
  };
}

export function createTreeFactoryBuildRequest(state) {
  const draft = clone(state.draft);
  const preset = draftToTreePreset(draft);
  const id = `${draft.speciesId}-${draft.seed}`;
  const frames = Number(draft.capture.azimuthCount) * 2;
  const columns = Math.ceil(Math.sqrt(frames));
  const rows = Math.ceil(frames / columns);
  return {
    schema: "nexus-tree-factory-build-request/1",
    id,
    tree: {
      id,
      seed: String(draft.seed),
      preset
    },
    lod: {
      impostor: {
        azimuthFrames: Number(draft.capture.azimuthCount),
        elevationDegrees: [
          Number(draft.capture.elevationLow),
          Number(draft.capture.elevationHigh)
        ],
        frameSize: Number(draft.capture.frameSize),
        columns,
        rows,
        dilationPasses: 4
      }
    },
    capture: {
      views: {
        azimuthCount: Number(draft.capture.azimuthCount),
        elevations: [
          Number(draft.capture.elevationLow),
          Number(draft.capture.elevationHigh)
        ]
      },
      framing: {
        mode: "per-view-projected-bounds",
        padding: Number(draft.capture.padding),
        preserveGroundAnchor: true,
        sharedScale: false
      },
      atlas: {
        columns,
        rows,
        frameSize: Number(draft.capture.frameSize),
        dilationPasses: 4
      }
    }
  };
}

export function recordTreeFactoryGeneration(state, record) {
  return {
    ...clone(state),
    generationLedger: [
      ...state.generationLedger,
      {
        sequence: state.generationLedger.length,
        id: String(record.id),
        objectHash: String(record.objectHash),
        treeHash: String(record.treeHash),
        branches: Number(record.branches),
        leaves: Number(record.leaves),
        buildMilliseconds: Number(record.buildMilliseconds)
      }
    ].slice(-50),
    revision: state.revision + 1
  };
}

export function recordTreeFactoryExport(state, record) {
  return {
    ...clone(state),
    exportLedger: [
      ...state.exportLedger,
      {
        sequence: state.exportLedger.length,
        objectId: String(record.objectId),
        format: String(record.format)
      }
    ].slice(-100),
    revision: state.revision + 1
  };
}

export function validateTreeFactoryState(value) {
  const errors = [];
  if (!value || value.schema !== "nexus-tree-factory-state/1") {
    errors.push("schema must be nexus-tree-factory-state/1");
  }
  try {
    getTreeSpecies(value?.selectedSpeciesId);
    draftToTreePreset(value?.draft);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  return { valid: errors.length === 0, errors };
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return clone(patch);
  const output = clone(base);
  for (const [key, value] of Object.entries(patch)) {
    output[key] = value && typeof value === "object" && !Array.isArray(value)
      ? deepMerge(output[key] ?? {}, value)
      : clone(value);
  }
  return output;
}
