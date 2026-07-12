const CORE_COMMIT = "d86188c66692d9c24815aa2b29612c70df8fde4e";

export async function importWithFallback(label, candidates) {
  const failures = [];

  for (const candidate of candidates) {
    try {
      return await import(candidate);
    } catch (error) {
      failures.push({
        url: candidate,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const summary = failures
    .map((failure, index) => `${index + 1}. ${failure.url}\n   ${failure.message}`)
    .join("\n");

  throw new Error(
    `Unable to load ${label} from every configured CDN source.\n${summary}`
  );
}

export function githubCdnCandidates({ owner, repository, commit, path }) {
  const normalizedPath = String(path).replace(/^\/+/, "");
  return [
    `https://cdn.jsdelivr.net/gh/${owner}/${repository}@${commit}/${normalizedPath}`,
    `https://fastly.jsdelivr.net/gh/${owner}/${repository}@${commit}/${normalizedPath}`,
    `https://cdn.statically.io/gh/${owner}/${repository}/${commit}/${normalizedPath}`,
    `https://cdn.jsdelivr.net/gh/${owner}/${repository}@main/${normalizedPath}`,
    `https://fastly.jsdelivr.net/gh/${owner}/${repository}@main/${normalizedPath}`,
    `https://cdn.statically.io/gh/${owner}/${repository}/main/${normalizedPath}`
  ];
}

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
