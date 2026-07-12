const TAU = Math.PI * 2;

export function createCapturePlan(profile = {}) {
  const azimuthCount = integer(profile.views?.azimuthCount, 8, 1, 64);
  const elevations = (profile.views?.elevations ?? [5, 25]).map(Number);
  const columns = integer(profile.atlas?.columns, 4, 1, 64);
  const rows = integer(profile.atlas?.rows, Math.ceil(azimuthCount * elevations.length / columns), 1, 64);
  const frameSize = integer(profile.atlas?.frameSize, 256, 32, 2048);
  const frameCount = azimuthCount * elevations.length;

  if (columns * rows < frameCount) {
    throw new RangeError("Capture atlas does not contain enough cells.");
  }

  const frames = [];
  for (let elevationIndex = 0; elevationIndex < elevations.length; elevationIndex += 1) {
    const elevationDegrees = elevations[elevationIndex];
    const elevation = elevationDegrees * Math.PI / 180;
    for (let azimuthIndex = 0; azimuthIndex < azimuthCount; azimuthIndex += 1) {
      const azimuth = azimuthIndex / azimuthCount * TAU;
      const frameIndex = elevationIndex * azimuthCount + azimuthIndex;
      frames.push({
        frameIndex,
        azimuthIndex,
        elevationIndex,
        azimuth,
        azimuthDegrees: azimuthIndex / azimuthCount * 360,
        elevation,
        elevationDegrees,
        cameraDirection: [
          Math.sin(azimuth) * Math.cos(elevation),
          Math.sin(elevation),
          Math.cos(azimuth) * Math.cos(elevation)
        ],
        atlasCell: {
          column: frameIndex % columns,
          row: Math.floor(frameIndex / columns)
        }
      });
    }
  }

  return {
    schema: "nexus-object-capture-plan/1",
    objectId: String(profile.objectId ?? "object"),
    pivot: vector(profile.pivot, [0, 0, 0]),
    groundAnchor: vector(profile.groundAnchor, [0, 0, 0]),
    framing: {
      mode: profile.framing?.mode ?? "per-view-projected-bounds",
      padding: Number(profile.framing?.padding ?? 0.08),
      preserveGroundAnchor: profile.framing?.preserveGroundAnchor !== false,
      sharedScale: Boolean(profile.framing?.sharedScale)
    },
    atlas: { columns, rows, frameSize },
    frames
  };
}

export function selectCapturePlanFrame(plan, viewVector) {
  const vector3 = vector(viewVector, [0, 0, 1]);
  const length = Math.hypot(...vector3) || 1;
  const direction = vector3.map((entry) => entry / length);

  let best = null;
  let bestDot = -Infinity;
  for (const frame of plan.frames) {
    const dot = frame.cameraDirection.reduce(
      (total, entry, index) => total + entry * direction[index],
      0
    );
    if (dot > bestDot) {
      bestDot = dot;
      best = frame;
    }
  }

  return { ...best, alignment: bestDot };
}

export function validateCapturePlan(plan) {
  const errors = [];
  if (!plan || plan.schema !== "nexus-object-capture-plan/1") {
    errors.push("schema must be nexus-object-capture-plan/1");
  }
  if (!Array.isArray(plan?.frames) || plan.frames.length === 0) {
    errors.push("capture plan requires frames");
  }
  if ((plan?.atlas?.columns ?? 0) * (plan?.atlas?.rows ?? 0) < (plan?.frames?.length ?? 0)) {
    errors.push("atlas capacity is smaller than frame count");
  }
  return { valid: errors.length === 0, errors };
}

function integer(value, fallback, min, max) {
  return Math.max(min, Math.min(max, Math.floor(Number(value ?? fallback))));
}

function vector(value, fallback) {
  const source = Array.isArray(value) && value.length === 3 ? value : fallback;
  return source.map(Number);
}
