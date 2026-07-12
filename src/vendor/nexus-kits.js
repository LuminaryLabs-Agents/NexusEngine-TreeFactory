import {
  githubCdnCandidates,
  importWithFallback
} from "./cdn-import.js";

const KITS_COMMIT = "9673594de5669b4691737b91a9d56fa282e74370";
const TREE_COMMIT = "956fe5431d573079a5f3a46597f89055676f3eab";

const [seedModule, objectModule, treeModule] = await Promise.all([
  importWithFallback(
    "NexusEngine seed kit",
    githubCdnCandidates({
      owner: "LuminaryLabs-Dev",
      repository: "NexusEngine-Kits",
      commit: KITS_COMMIT,
      path: "kits/foundation/seed-kit/index.js"
    })
  ),
  importWithFallback(
    "NexusEngine procedural objects domain",
    githubCdnCandidates({
      owner: "LuminaryLabs-Dev",
      repository: "NexusEngine-Kits",
      commit: KITS_COMMIT,
      path: "domains/procedural-objects/index.js"
    })
  ),
  importWithFallback(
    "NexusEngine procedural tree kits",
    githubCdnCandidates({
      owner: "LuminaryLabs-Agents",
      repository: "NexusEngine-ProtoKits",
      commit: TREE_COMMIT,
      path: "protokits/procedural-tree-kits/index.js"
    })
  )
]);

export const createSeedKit = seedModule.createSeedKit;
export const createGenericSeedKit = seedModule.createGenericSeedKit;
export const createProceduralObjectsDomainKits = objectModule.createProceduralObjectsDomainKits;
export const createProceduralTreeKits = treeModule.createProceduralTreeKits;
export const createProceduralTreeSuite = treeModule.createProceduralTreeSuite;
export const createThreeTreeRenderAdapter = treeModule.createThreeTreeRenderAdapter;
export const createTreeObjectDescriptor = treeModule.createTreeObjectDescriptor;
