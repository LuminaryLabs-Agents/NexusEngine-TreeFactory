const clone = (value) => value === undefined ? undefined : structuredClone(value);

function text(value, label) {
  const next = String(value ?? "").trim();
  if (!next) throw new TypeError(`${label} requires a non-empty value.`);
  return next;
}

function createInitialState() {
  return {
    schema: "nexus-tree-object-contract-adapter/1",
    version: "0.1.0",
    conversions: 0,
    preserved: 0,
    cacheHits: 0,
    cacheSize: 0,
    lastObjectId: null,
    lastReason: "initialized"
  };
}

export function createTreeObjectContractAdapterKit(NexusEngine = {}, options = {}) {
  if (typeof NexusEngine.defineDomainServiceKit !== "function") {
    throw new TypeError("Tree object contract adapter requires NexusEngine.defineDomainServiceKit.");
  }
  if (typeof NexusEngine.validateObjectDescriptor !== "function") {
    throw new TypeError("Tree object contract adapter requires NexusEngine.validateObjectDescriptor.");
  }
  if (typeof options.createTreeObjectDescriptor !== "function") {
    throw new TypeError("Tree object contract adapter requires createTreeObjectDescriptor.");
  }

  const cacheLimit = Math.max(1, Math.floor(Number(options.cacheLimit ?? 64)));
  const cache = new Map();
  let state = createInitialState();

  function updateState(patch = {}) {
    state = {
      ...state,
      ...clone(patch),
      cacheSize: cache.size
    };
  }

  function cacheKey(treeDescriptor) {
    return `${text(treeDescriptor?.id, "tree.id")}:${String(treeDescriptor?.hash ?? "unhashed")}`;
  }

  function cacheDescriptor(key, descriptor) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, clone(descriptor));
    while (cache.size > cacheLimit) cache.delete(cache.keys().next().value);
    updateState();
  }

  function validateObject(descriptor, treeId) {
    const result = NexusEngine.validateObjectDescriptor(descriptor);
    return {
      valid: result.valid === true && descriptor?.id === treeId,
      errors: [
        ...(result.errors ?? []),
        ...(descriptor?.id === treeId ? [] : ["objectDescriptor id must match tree id"])
      ]
    };
  }

  function decorateTreeDescriptor(treeDescriptor) {
    if (!treeDescriptor || treeDescriptor.schema !== "nexus-tree-descriptor/1") {
      throw new TypeError("Tree object contract adapter requires nexus-tree-descriptor/1.");
    }

    const treeId = text(treeDescriptor.id, "tree.id");
    const key = cacheKey(treeDescriptor);
    const candidate = treeDescriptor.objectDescriptor;
    const candidateValidation = candidate
      ? validateObject(candidate, treeId)
      : { valid: false, errors: ["objectDescriptor is missing"] };

    if (candidateValidation.valid) {
      cacheDescriptor(key, candidate);
      updateState({
        preserved: state.preserved + 1,
        lastObjectId: treeId,
        lastReason: "preserved-valid-object-descriptor"
      });
      return clone(treeDescriptor);
    }

    if (cache.has(key)) {
      const cached = cache.get(key);
      const cachedValidation = validateObject(cached, treeId);
      if (cachedValidation.valid) {
        updateState({
          cacheHits: state.cacheHits + 1,
          lastObjectId: treeId,
          lastReason: "cache-hit"
        });
        return {
          ...clone(treeDescriptor),
          objectDescriptor: clone(cached)
        };
      }
      cache.delete(key);
    }

    const objectDescriptor = options.createTreeObjectDescriptor(treeDescriptor);
    const validation = validateObject(objectDescriptor, treeId);
    if (!validation.valid) {
      throw new TypeError(`Tree object conversion failed: ${validation.errors.join("; ")}`);
    }

    cacheDescriptor(key, objectDescriptor);
    updateState({
      conversions: state.conversions + 1,
      lastObjectId: treeId,
      lastReason: candidate ? "replaced-invalid-object-descriptor" : "created-missing-object-descriptor"
    });
    return {
      ...clone(treeDescriptor),
      objectDescriptor: clone(objectDescriptor)
    };
  }

  function decorateSnapshot(snapshot = {}) {
    return {
      ...clone(snapshot),
      descriptors: (snapshot.descriptors ?? []).map(decorateTreeDescriptor)
    };
  }

  return NexusEngine.defineDomainServiceKit({
    id: options.id ?? "tree-object-contract-adapter-kit",
    domain: "tree-object-contract-adapter",
    domainPath: "n:natural-world:tree:procedural:object-contract",
    parentDomainPath: "n:natural-world:tree:procedural",
    apiName: "treeObjectContractAdapter",
    stability: "compatibility",
    version: "0.1.0",
    services: ["object-contract-decoration", "validation", "bounded-cache", "snapshot", "reset"],
    requires: ["tree:procedural-descriptor"],
    provides: ["tree:object-contract-adapter"],
    createApi() {
      return Object.freeze({
        decorateTreeDescriptor,
        getSnapshot: () => clone(state),
        reset() {
          cache.clear();
          state = createInitialState();
          return clone(state);
        }
      });
    },
    install({ engine }) {
      const source = engine.n?.proceduralTree;
      if (!source || typeof source.generate !== "function") {
        throw new Error("Tree object contract adapter requires engine.n.proceduralTree.");
      }
      const adapter = engine.n.treeObjectContractAdapter;
      const wrapped = Object.freeze({
        ...source,
        generate(input = {}) {
          return adapter.decorateTreeDescriptor(source.generate(input));
        },
        get(id) {
          const descriptor = source.get(id);
          return descriptor ? adapter.decorateTreeDescriptor(descriptor) : null;
        },
        list() {
          return source.list().map(adapter.decorateTreeDescriptor);
        },
        getObjectDescriptor(id) {
          return wrapped.get(id)?.objectDescriptor ?? null;
        },
        getSnapshot() {
          return decorateSnapshot(source.getSnapshot?.() ?? { descriptors: source.list() });
        },
        loadSnapshot(snapshot = {}) {
          source.loadSnapshot?.(snapshot);
          return wrapped.getSnapshot();
        },
        reset() {
          source.reset?.();
          adapter.reset();
          return wrapped.getSnapshot();
        }
      });
      engine.n.proceduralTree = wrapped;
      engine.proceduralTree = wrapped;
    },
    metadata: {
      scope: "tree-factory-compatibility-adapter",
      rendererAgnostic: true,
      deterministic: true,
      ownsLoop: false,
      cacheLimit,
      boundary: "Repairs missing or invalid tree object descriptors through the official procedural-tree converter and NexusEngine Core Object validation. It does not generate tree morphology, duplicate the object contract, create renderer objects, or own GPU work."
    }
  });
}

export default createTreeObjectContractAdapterKit;
