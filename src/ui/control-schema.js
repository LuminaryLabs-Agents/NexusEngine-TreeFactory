export const CONTROL_GROUPS = [
  {
    id: "shape",
    label: "Shape",
    controls: [
      range("morphology.height", "Height", 4, 60, 0.5, "m"),
      range("morphology.trunkRadius", "Trunk radius", 0.1, 3, 0.02, "m"),
      select("morphology.crownShape", "Crown", [
        ["round", "Round"],
        ["conical", "Conical"],
        ["umbrella", "Umbrella"],
        ["columnar", "Columnar"]
      ]),
      range("morphology.crownStart", "Crown start", 0.05, 0.85, 0.01, ""),
      range("morphology.levels", "Branch levels", 1, 5, 1, ""),
      range("morphology.branchScale", "Branch density", 0.25, 2, 0.05, "×"),
      range("morphology.branchAngleMin", "Branch angle min", 0, 120, 1, "°"),
      range("morphology.branchAngleMax", "Branch angle max", 10, 175, 1, "°")
    ]
  },
  {
    id: "growth",
    label: "Growth",
    controls: [
      range("morphology.taper", "Taper", 0.1, 2, 0.02, ""),
      range("morphology.gnarl", "Gnarl", 0, 1.5, 0.02, ""),
      range("morphology.upwardBias", "Upward bias", -1, 1, 0.02, ""),
      range("morphology.gravity", "Gravity", -1, 1, 0.02, ""),
      range("morphology.leafDensity", "Leaf density", 0, 16, 1, ""),
      range("morphology.leafSizeMin", "Leaf size min", 0.05, 2, 0.02, "m"),
      range("morphology.leafSizeMax", "Leaf size max", 0.05, 3, 0.02, "m")
    ]
  },
  {
    id: "materials",
    label: "Materials",
    controls: [
      color("materials.barkColor", "Bark"),
      range("materials.barkRoughness", "Bark roughness", 0, 1, 0.01, ""),
      color("materials.leafColor", "Leaf"),
      color("materials.leafTipColor", "Leaf tip"),
      range("materials.leafRoughness", "Leaf roughness", 0, 1, 0.01, ""),
      range("materials.translucency", "Translucency", 0, 1, 0.01, ""),
      select("materials.textureSize", "Texture size", [
        [64, "64"],
        [128, "128"],
        [256, "256"],
        [512, "512"]
      ])
    ]
  },
  {
    id: "capture",
    label: "Capture",
    controls: [
      select("capture.azimuthCount", "Azimuth views", [
        [4, "4"],
        [8, "8"],
        [12, "12"],
        [16, "16"]
      ]),
      range("capture.elevationLow", "Elevation low", -15, 45, 1, "°"),
      range("capture.elevationHigh", "Elevation high", 0, 70, 1, "°"),
      select("capture.frameSize", "Frame size", [
        [128, "128"],
        [256, "256"],
        [512, "512"]
      ]),
      range("capture.padding", "Frame padding", 0.02, 0.25, 0.01, "")
    ]
  }
];

function range(path, label, min, max, step, unit) {
  return { type: "range", path, label, min, max, step, unit };
}

function select(path, label, options) {
  return { type: "select", path, label, options };
}

function color(path, label) {
  return { type: "color", path, label };
}
