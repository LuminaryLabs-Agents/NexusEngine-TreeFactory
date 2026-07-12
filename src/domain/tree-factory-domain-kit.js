import { defineDomainServiceKit } from "nexusengine";
import {
  createTreeFactoryBuildRequest,
  createTreeFactoryState,
  patchTreeFactoryDraft,
  recordTreeFactoryExport,
  recordTreeFactoryGeneration,
  selectTreeFactorySpecies,
  validateTreeFactoryState
} from "./tree-factory-state.js";
import { listTreeSpecies } from "./species-presets.js";

const clone = (value) => structuredClone(value);

export function createTreeFactoryDomainKit(config = {}) {
  let state = createTreeFactoryState(config);

  return defineDomainServiceKit({
    id: config.id ?? "tree-factory-domain-kit",
    domain: "tree-factory",
    domainPath: "n:object:procedural:tree:factory",
    parentDomainPath: "n:object:procedural:tree",
    apiName: "treeFactory",
    stability: "experimental",
    version: "0.1.0",
    services: [
      "species-registry",
      "editable-tree-draft",
      "build-request",
      "generation-ledger",
      "export-ledger",
      "snapshot",
      "reset"
    ],
    provides: [
      "tree-factory:species-registry",
      "tree-factory:build-request",
      "tree-factory:lab-state"
    ],
    createApi() {
      const api = {
        listSpecies: listTreeSpecies,
        getState: () => clone(state),
        getSnapshot: () => clone(state),
        selectSpecies(speciesId) {
          state = selectTreeFactorySpecies(state, speciesId);
          return clone(state);
        },
        updateDraft(patch) {
          state = patchTreeFactoryDraft(state, patch);
          return clone(state);
        },
        createBuildRequest() {
          return createTreeFactoryBuildRequest(state);
        },
        recordGeneration(record) {
          state = recordTreeFactoryGeneration(state, record);
          return clone(state);
        },
        recordExport(record) {
          state = recordTreeFactoryExport(state, record);
          return clone(state);
        },
        loadSnapshot(snapshot) {
          const result = validateTreeFactoryState(snapshot);
          if (!result.valid) {
            throw new TypeError(`Invalid TreeFactory snapshot: ${result.errors.join("; ")}`);
          }
          state = clone(snapshot);
          return clone(state);
        },
        reset() {
          state = createTreeFactoryState(config);
          return clone(state);
        }
      };
      return Object.freeze(api);
    },
    install({ engine }) {
      engine.treeFactory = engine.n.treeFactory;
    },
    metadata: {
      scope: "tree-factory-application-domain",
      rendererAgnostic: true,
      deterministic: true,
      ownsLoop: false,
      boundary: "Owns TreeFactory species, editable draft state, build requests, and ledgers. Tree generation, universal objects, procedural object services, rendering, capture, and export remain separate domains or adapters."
    }
  });
}

export default createTreeFactoryDomainKit;
