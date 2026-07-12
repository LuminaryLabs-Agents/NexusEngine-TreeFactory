function staticRelativeSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /\bimport\s*["']([^"']+)["']/g,
    /\bimport\s+[^;]*?\s+from\s*["']([^"']+)["']/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s+from\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1].startsWith("./") || match[1].startsWith("../")) {
        specifiers.add(match[1]);
      }
    }
  }
  return [...specifiers];
}

async function inspectModule(url, fetcher, visited) {
  if (visited.has(url)) return null;
  visited.add(url);

  let response;
  try {
    response = await fetcher(url, { cache: "no-store" });
  } catch {
    return null;
  }

  if (response.status === 404) return { status: 404, url };
  if (!response.ok) return null;

  let source;
  try {
    source = await response.text();
  } catch {
    return null;
  }

  for (const specifier of staticRelativeSpecifiers(source)) {
    const missing = await inspectModule(new URL(specifier, url).href, fetcher, visited);
    if (missing) return missing;
  }
  return null;
}

export async function findDeterministicModuleGraph404(entryUrl, options = {}) {
  const fetcher = options.fetcher ?? globalThis.fetch;
  if (typeof fetcher !== "function") return null;
  return inspectModule(String(entryUrl), fetcher, new Set());
}

export async function importWithFallback(label, candidates, options = {}) {
  const importer = options.importer ?? ((url) => import(url));
  const probe = options.probe ?? findDeterministicModuleGraph404;
  const failures = [];

  for (const candidate of candidates) {
    try {
      return await importer(candidate);
    } catch (error) {
      const failure = {
        url: candidate,
        message: error instanceof Error ? error.message : String(error)
      };
      failures.push(failure);

      let missing = null;
      try {
        missing = await probe(candidate);
      } catch {}

      if (missing?.status === 404) {
        const summary = failures
          .map((entry, index) => `${index + 1}. ${entry.url}\n   ${entry.message}`)
          .join("\n");
        throw new Error(
          `Unable to load ${label}: deterministic module-graph 404 at ${missing.url}. Equivalent CDN retries were stopped.\n${summary}`
        );
      }
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
    `https://fastly.jsdelivr.net/gh/${owner}/${repository}@${commit}/${normalizedPath}`
  ];
}
