import {
  githubCdnCandidates,
  importWithFallback
} from "./cdn-import.js";

export {
  findDeterministicModuleGraph404,
  githubCdnCandidates,
  importWithFallback
} from "./cdn-import.js";

const CORE_COMMIT = "c5548de504072bf09eb68986b98aca0292903803";

const runtime = await importWithFallback(
  "NexusEngine",
  githubCdnCandidates({
    owner: "LuminaryLabs-Dev",
    repository: "NexusEngine",
    commit: CORE_COMMIT,
    path: "src/index.js"
  })
);

export const createRealtimeGame = runtime.createRealtimeGame;
export const createGameKitComposer = runtime.createGameKitComposer;
export const createCoreObjectKit = runtime.createCoreObjectKit;
export const createObjectDescriptor = runtime.createObjectDescriptor;
export const validateObjectDescriptor = runtime.validateObjectDescriptor;
export const updateObjectLifecycle = runtime.updateObjectLifecycle;
export const hashObjectDescriptor = runtime.hashObjectDescriptor;
export const defineDomainServiceKit = runtime.defineDomainServiceKit;
export const createScopedSeed = runtime.createScopedSeed;
export const createSeededRandom = runtime.createSeededRandom;
export const hashSeed = runtime.hashSeed;

export default runtime;
