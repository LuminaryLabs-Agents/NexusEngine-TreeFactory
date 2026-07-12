import assert from "node:assert/strict";
import {
  createCapturePlan,
  selectCapturePlanFrame,
  validateCapturePlan
} from "../src/domain/capture-plan.js";

const plan = createCapturePlan({
  objectId: "oak-1737",
  pivot: [0, 7, 0],
  groundAnchor: [0, 0, 0],
  views: {
    azimuthCount: 8,
    elevations: [5, 25]
  },
  atlas: {
    columns: 4,
    rows: 4,
    frameSize: 256
  }
});

assert.equal(plan.frames.length, 16);
assert.equal(validateCapturePlan(plan).valid, true);

const front = selectCapturePlanFrame(plan, [0, 0, 1]);
assert.equal(front.azimuthIndex, 0);
assert.ok(front.alignment > 0.9);

const right = selectCapturePlanFrame(plan, [1, 0, 0]);
assert.equal(right.azimuthIndex, 2);

const cells = new Set(plan.frames.map((frame) =>
  `${frame.atlasCell.column}:${frame.atlasCell.row}`
));
assert.equal(cells.size, plan.frames.length);

console.log("capture plan tests passed", {
  frames: plan.frames.length
});
