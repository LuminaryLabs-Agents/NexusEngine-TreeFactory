const freeze = (value) => Object.freeze(value);

export const TREE_SPECIES = freeze([
  species("oak", "Ancient Oak", "Broadleaf", "Wide balanced crown", {
    height: 15, trunkRadius: 0.68, crownShape: "round", crownStart: 0.24,
    levels: 3, branchCounts: [8, 4, 2, 2], branchLengthRatio: [0.42, 0.62, 0.58, 0.52],
    branchAngleDegrees: [48, 56], taper: 0.68, gnarl: 0.24, upwardBias: 0.24,
    gravity: 0.11, leafDensity: 6, leafSize: [0.48, 0.82], trunkSegments: 22,
    branchSegmentsPerMeter: 1.42
  }, "#76543b", "#3f813b", "#82ad50"),
  species("pine", "Mountain Pine", "Conifer", "Tall conical crown", {
    height: 19, trunkRadius: 0.52, crownShape: "conical", crownStart: 0.16,
    levels: 4, branchCounts: [10, 5, 3, 2, 1], branchLengthRatio: [0.34, 0.58, 0.54, 0.48, 0.42],
    branchAngleDegrees: [62, 78], taper: 0.82, gnarl: 0.08, upwardBias: 0.06,
    gravity: 0.18, leafDensity: 8, leafSize: [0.22, 0.46], trunkSegments: 28,
    branchSegmentsPerMeter: 1.25
  }, "#66503b", "#244f31", "#4d7c47"),
  species("birch", "Silver Birch", "Broadleaf", "Light narrow canopy", {
    height: 17, trunkRadius: 0.36, crownShape: "columnar", crownStart: 0.32,
    levels: 3, branchCounts: [7, 4, 2, 1], branchLengthRatio: [0.31, 0.56, 0.51, 0.45],
    branchAngleDegrees: [38, 52], taper: 0.76, gnarl: 0.12, upwardBias: 0.42,
    gravity: 0.08, leafDensity: 5, leafSize: [0.36, 0.64], trunkSegments: 25,
    branchSegmentsPerMeter: 1.5
  }, "#d8d3c2", "#5f8c45", "#91ba63"),
  species("willow", "Weeping Willow", "Broadleaf", "Drooping umbrella crown", {
    height: 13, trunkRadius: 0.72, crownShape: "umbrella", crownStart: 0.31,
    levels: 4, branchCounts: [9, 5, 3, 2, 1], branchLengthRatio: [0.48, 0.72, 0.66, 0.58, 0.5],
    branchAngleDegrees: [54, 74], taper: 0.62, gnarl: 0.28, upwardBias: -0.08,
    gravity: 0.48, leafDensity: 9, leafSize: [0.32, 0.6], trunkSegments: 24,
    branchSegmentsPerMeter: 1.7
  }, "#6f5037", "#55773f", "#91a95b"),
  species("baobab", "Ancient Baobab", "Savanna", "Massive trunk and compact crown", {
    height: 10, trunkRadius: 1.75, crownShape: "round", crownStart: 0.52,
    levels: 3, branchCounts: [7, 4, 2, 1], branchLengthRatio: [0.38, 0.58, 0.5, 0.44],
    branchAngleDegrees: [42, 62], taper: 0.48, gnarl: 0.48, upwardBias: 0.32,
    gravity: 0.04, leafDensity: 4, leafSize: [0.52, 0.92], trunkSegments: 20,
    branchSegmentsPerMeter: 1.35
  }, "#806046", "#4f7a3d", "#7fa55a"),
  species("redwood", "Coastal Redwood", "Conifer", "Extreme height and columnar form", {
    height: 42, trunkRadius: 1.25, crownShape: "columnar", crownStart: 0.08,
    levels: 4, branchCounts: [12, 5, 3, 2, 1], branchLengthRatio: [0.24, 0.52, 0.47, 0.42, 0.38],
    branchAngleDegrees: [58, 76], taper: 0.88, gnarl: 0.09, upwardBias: 0.18,
    gravity: 0.1, leafDensity: 7, leafSize: [0.2, 0.42], trunkSegments: 48,
    branchSegmentsPerMeter: 0.9
  }, "#743f2e", "#245b39", "#4d8552"),
  species("acacia", "Umbrella Acacia", "Savanna", "Flat spreading crown", {
    height: 11, trunkRadius: 0.58, crownShape: "umbrella", crownStart: 0.48,
    levels: 3, branchCounts: [8, 5, 3, 1], branchLengthRatio: [0.52, 0.78, 0.68, 0.55],
    branchAngleDegrees: [52, 72], taper: 0.57, gnarl: 0.25, upwardBias: 0.06,
    gravity: 0.08, leafDensity: 7, leafSize: [0.3, 0.58], trunkSegments: 20,
    branchSegmentsPerMeter: 1.45
  }, "#76553b", "#4f743c", "#84a95a"),
  species("cypress", "Italian Cypress", "Conifer", "Dense vertical silhouette", {
    height: 18, trunkRadius: 0.4, crownShape: "columnar", crownStart: 0.08,
    levels: 4, branchCounts: [10, 4, 3, 2, 1], branchLengthRatio: [0.2, 0.42, 0.38, 0.34, 0.3],
    branchAngleDegrees: [22, 38], taper: 0.82, gnarl: 0.05, upwardBias: 0.62,
    gravity: 0.02, leafDensity: 10, leafSize: [0.18, 0.36], trunkSegments: 27,
    branchSegmentsPerMeter: 1.3
  }, "#5c4634", "#1f4f33", "#3a7044"),
  species("maple", "Autumn Maple", "Broadleaf", "Full layered crown", {
    height: 14, trunkRadius: 0.62, crownShape: "round", crownStart: 0.26,
    levels: 4, branchCounts: [9, 5, 3, 2, 1], branchLengthRatio: [0.43, 0.65, 0.59, 0.52, 0.44],
    branchAngleDegrees: [44, 58], taper: 0.64, gnarl: 0.22, upwardBias: 0.26,
    gravity: 0.12, leafDensity: 8, leafSize: [0.44, 0.78], trunkSegments: 23,
    branchSegmentsPerMeter: 1.48
  }, "#72503b", "#9a4e2f", "#d89b42"),
  species("deadwood", "Deadwood Snag", "Dead tree", "Bare weathered silhouette", {
    height: 12, trunkRadius: 0.66, crownShape: "round", crownStart: 0.28,
    levels: 3, branchCounts: [7, 4, 2, 1], branchLengthRatio: [0.38, 0.58, 0.5, 0.42],
    branchAngleDegrees: [44, 67], taper: 0.74, gnarl: 0.52, upwardBias: 0.06,
    gravity: 0.16, leafDensity: 0, leafSize: [0.3, 0.5], trunkSegments: 22,
    branchSegmentsPerMeter: 1.35
  }, "#625246", "#5d654b", "#77775a")
]);

function species(id, label, category, description, morphology, barkColor, leafColor, leafTipColor) {
  return freeze({
    id,
    label,
    category,
    description,
    preset: freeze({
      schema: "nexus-tree-preset/1",
      species: `tree-factory-${id}`,
      morphology: freeze({ ...morphology }),
      materials: freeze({
        textureSize: 256,
        bark: freeze({
          baseColor: barkColor,
          ridgeScale: id === "birch" ? 18 : 11,
          ridgeStrength: id === "birch" ? 0.4 : 0.68,
          crackStrength: id === "redwood" ? 0.42 : 0.25,
          roughness: 0.84
        }),
        leaf: freeze({
          baseColor: leafColor,
          tipColor: leafTipColor,
          veinStrength: 0.7,
          roughness: 0.7,
          translucency: id === "deadwood" ? 0 : 0.18
        })
      })
    })
  });
}

export function listTreeSpecies() {
  return TREE_SPECIES.map((entry) => structuredClone(entry));
}

export function getTreeSpecies(id) {
  const species = TREE_SPECIES.find((entry) => entry.id === String(id));
  if (!species) throw new RangeError(`Unknown TreeFactory species: ${id}`);
  return structuredClone(species);
}

export function createDraftFromSpecies(id, seed = 1737) {
  const entry = getTreeSpecies(id);
  const morphology = entry.preset.morphology;
  const materials = entry.preset.materials;
  return {
    schema: "nexus-tree-factory-draft/1",
    speciesId: entry.id,
    seed: String(seed),
    morphology: {
      height: morphology.height,
      trunkRadius: morphology.trunkRadius,
      crownShape: morphology.crownShape,
      crownStart: morphology.crownStart,
      levels: morphology.levels,
      branchScale: 1,
      branchAngleMin: morphology.branchAngleDegrees[0],
      branchAngleMax: morphology.branchAngleDegrees[1],
      taper: morphology.taper,
      gnarl: morphology.gnarl,
      upwardBias: morphology.upwardBias,
      gravity: morphology.gravity,
      leafDensity: morphology.leafDensity,
      leafSizeMin: morphology.leafSize[0],
      leafSizeMax: morphology.leafSize[1]
    },
    materials: {
      textureSize: materials.textureSize,
      barkColor: materials.bark.baseColor,
      barkRoughness: materials.bark.roughness,
      leafColor: materials.leaf.baseColor,
      leafTipColor: materials.leaf.tipColor,
      leafRoughness: materials.leaf.roughness,
      translucency: materials.leaf.translucency
    },
    capture: {
      azimuthCount: 8,
      elevationLow: 5,
      elevationHigh: 25,
      frameSize: 256,
      padding: 0.08
    }
  };
}

export function draftToTreePreset(draft) {
  const entry = getTreeSpecies(draft.speciesId);
  const base = entry.preset;
  const source = base.morphology;
  const scale = Number(draft.morphology.branchScale ?? 1);
  return {
    schema: "nexus-tree-preset/1",
    species: base.species,
    morphology: {
      ...source,
      height: Number(draft.morphology.height),
      trunkRadius: Number(draft.morphology.trunkRadius),
      crownShape: draft.morphology.crownShape,
      crownStart: Number(draft.morphology.crownStart),
      levels: Math.round(Number(draft.morphology.levels)),
      branchCounts: source.branchCounts.map((count) => Math.max(0, Math.round(count * scale))),
      branchAngleDegrees: [
        Number(draft.morphology.branchAngleMin),
        Number(draft.morphology.branchAngleMax)
      ],
      taper: Number(draft.morphology.taper),
      gnarl: Number(draft.morphology.gnarl),
      upwardBias: Number(draft.morphology.upwardBias),
      gravity: Number(draft.morphology.gravity),
      leafDensity: Math.round(Number(draft.morphology.leafDensity)),
      leafSize: [
        Number(draft.morphology.leafSizeMin),
        Number(draft.morphology.leafSizeMax)
      ]
    },
    materials: {
      ...base.materials,
      textureSize: Number(draft.materials.textureSize),
      bark: {
        ...base.materials.bark,
        baseColor: draft.materials.barkColor,
        roughness: Number(draft.materials.barkRoughness)
      },
      leaf: {
        ...base.materials.leaf,
        baseColor: draft.materials.leafColor,
        tipColor: draft.materials.leafTipColor,
        roughness: Number(draft.materials.leafRoughness),
        translucency: Number(draft.materials.translucency)
      }
    }
  };
}
