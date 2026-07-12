import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as NexusEngine from "nexusengine";
import { createSeedKit } from "@luminarylabs/nexusengine-kits/seed-kit";
import {
  createProceduralObjectsDomainKits
} from "@luminarylabs/nexusengine-kits/procedural-objects";
import {
  createProceduralTreeKits,
  createThreeTreeRenderAdapter
} from "@luminarylabs/nexusengine-protokits/procedural-tree-kits";

import { createTreeFactoryDomainKit } from "./domain/tree-factory-domain-kit.js";
import { createCapturePlan } from "./domain/capture-plan.js";
import { CONTROL_GROUPS } from "./ui/control-schema.js";
import {
  downloadCanvasPng,
  downloadJson,
  exportObjectAsGlb
} from "./export/game-ready-exporter.js";

const elements = {
  viewport: document.querySelector("#viewport"),
  speciesGrid: document.querySelector("#species-grid"),
  speciesCount: document.querySelector("#species-count"),
  controls: document.querySelector("#control-groups"),
  buildStats: document.querySelector("#build-stats"),
  objectPreview: document.querySelector("#object-preview"),
  atlasPreview: document.querySelector("#atlas-preview"),
  captureGrid: document.querySelector("#capture-grid"),
  captureStatus: document.querySelector("#capture-status"),
  viewportStatus: document.querySelector("#viewport-status"),
  lodMode: document.querySelector("#lod-mode"),
  autoBuild: document.querySelector("#auto-build"),
  showBounds: document.querySelector("#show-bounds"),
  rotateTree: document.querySelector("#rotate-tree"),
  fatal: document.querySelector("#fatal"),
  fatalMessage: document.querySelector("#fatal-message")
};

let rebuildTimer = null;
let current = null;
let boundsHelper = null;

try {
  const renderer = new THREE.WebGLRenderer({
    canvas: elements.viewport,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdbe9ee);
  scene.fog = new THREE.Fog(0xdbe9ee, 55, 150);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.05, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.495;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x55704c, 2.6));

  const sun = new THREE.DirectionalLight(0xffefcf, 3.4);
  sun.position.set(18, 32, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.00025;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xb5dcff, 1.1);
  fill.position.set(-16, 11, -14);
  scene.add(fill);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 128),
    new THREE.MeshStandardMaterial({
      color: 0x6d8f59,
      roughness: 0.96,
      metalness: 0
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const engine = NexusEngine.createRealtimeGame({
    kits: [
      NexusEngine.createCoreObjectKit(),
      createSeedKit({ seed: "nexus-tree-factory" }),
      ...createProceduralObjectsDomainKits(),
      ...createProceduralTreeKits(NexusEngine, {
        pbr: { textureSize: 256 }
      }),
      createTreeFactoryDomainKit({
        initialSpeciesId: "oak",
        seed: 1737
      })
    ]
  });

  const treeRenderer = createThreeTreeRenderAdapter({ THREE, renderer });

  renderSpecies();
  renderControls();
  wireActions();
  resize();
  buildTree();

  const clock = new THREE.Clock();
  requestAnimationFrame(frame);

  function renderSpecies() {
    const species = engine.n.treeFactory.listSpecies();
    const selected = engine.n.treeFactory.getState().selectedSpeciesId;
    elements.speciesCount.textContent = `${species.length} presets`;
    elements.speciesGrid.replaceChildren();

    for (const entry of species) {
      const button = document.createElement("button");
      button.className = `species-card${entry.id === selected ? " active" : ""}`;
      button.dataset.speciesId = entry.id;
      button.innerHTML = `<strong>${entry.label}</strong><span>${entry.category} · ${entry.description}</span>`;
      button.addEventListener("click", () => {
        engine.n.treeFactory.selectSpecies(entry.id);
        renderSpecies();
        renderControls();
        scheduleBuild();
      });
      elements.speciesGrid.append(button);
    }
  }

  function renderControls() {
    const draft = engine.n.treeFactory.getState().draft;
    elements.controls.replaceChildren();

    for (const group of CONTROL_GROUPS) {
      const wrapper = document.createElement("div");
      wrapper.className = "control-group";
      wrapper.innerHTML = `<h3>${group.label}</h3>`;

      for (const control of group.controls) {
        const row = document.createElement("div");
        row.className = "control-row";

        const label = document.createElement("label");
        label.textContent = control.label;
        row.append(label);

        const input = createControlInput(control, getByPath(draft, control.path));
        input.dataset.path = control.path;
        row.append(input);

        if (control.type === "range") {
          const output = document.createElement("output");
          output.textContent = formatControlValue(input.value, control.unit);
          input.addEventListener("input", () => {
            output.textContent = formatControlValue(input.value, control.unit);
          });
          row.append(output);
        }

        input.addEventListener("input", () => {
          patchDraft(control.path, readControlValue(input, control));
          scheduleBuild();
        });
        input.addEventListener("change", () => {
          patchDraft(control.path, readControlValue(input, control));
          scheduleBuild();
        });

        wrapper.append(row);
      }

      elements.controls.append(wrapper);
    }
  }

  function wireActions() {
    document.querySelector("#generate-tree").addEventListener("click", buildTree);

    document.querySelector("#randomize-seed").addEventListener("click", () => {
      patchDraft("seed", String(Math.floor(1 + Math.random() * 999999)));
      renderControls();
      buildTree();
    });

    document.querySelector("#reset-species").addEventListener("click", () => {
      const state = engine.n.treeFactory.getState();
      engine.n.treeFactory.selectSpecies(state.selectedSpeciesId);
      renderControls();
      buildTree();
    });

    elements.showBounds.addEventListener("change", updateBoundsVisibility);

    document.querySelector("#export-preset").addEventListener("click", () => {
      ensureCurrent();
      const state = engine.n.treeFactory.getSnapshot();
      downloadJson(
        {
          schema: "nexus-tree-factory-preset/1",
          draft: state.draft
        },
        `${current.objectDescriptor.id}.tree-factory-preset.json`
      );
      engine.n.treeFactory.recordExport({
        objectId: current.objectDescriptor.id,
        format: "tree-factory-preset"
      });
    });

    document.querySelector("#export-object").addEventListener("click", async () => {
      ensureCurrent();
      const renderExport = await treeRenderer.exportAsset(current.renderAsset);
      const treeAsset = engine.n.treeAssetSnapshot.package({
        id: current.objectDescriptor.id,
        treeDescriptor: current.treeDescriptor,
        pbrFields: current.pbrFields,
        lodDescriptor: current.treeLodDescriptor,
        render: {
          ...renderExport.metadata,
          objectDescriptor: current.objectDescriptor,
          proceduralObjectMaterial: current.objectMaterial,
          proceduralObjectLod: current.objectLod,
          captureProfile: current.captureProfile,
          capturePlan: current.capturePlan
        }
      });

      downloadJson(
        {
          schema: "nexus-tree-factory-object-export/1",
          object: engine.n.coreObject.get(current.objectDescriptor.id),
          proceduralObject: {
            material: current.objectMaterial,
            lod: current.objectLod,
            captureProfile: current.captureProfile
          },
          capturePlan: current.capturePlan,
          treeAsset
        },
        `${current.objectDescriptor.id}.nexus-object.json`
      );

      engine.n.treeFactory.recordExport({
        objectId: current.objectDescriptor.id,
        format: "nexus-object-json"
      });
    });

    document.querySelector("#export-glb").addEventListener("click", async () => {
      ensureCurrent();
      await exportObjectAsGlb(
        current.renderAsset.levels[0],
        `${current.objectDescriptor.id}-lod0.glb`
      );
      engine.n.treeFactory.recordExport({
        objectId: current.objectDescriptor.id,
        format: "glb"
      });
    });

    document.querySelector("#export-atlas").addEventListener("click", async () => {
      ensureCurrent();
      await downloadCanvasPng(
        current.renderAsset.atlas.canvas,
        `${current.objectDescriptor.id}-impostor.png`
      );
      engine.n.treeFactory.recordExport({
        objectId: current.objectDescriptor.id,
        format: "impostor-png"
      });
    });

    document.querySelector("#import-preset").addEventListener("change", async (event) => {
      const [file] = event.target.files ?? [];
      if (!file) return;
      const parsed = JSON.parse(await file.text());
      const draft = parsed.draft ?? parsed;
      engine.n.treeFactory.selectSpecies(draft.speciesId);
      engine.n.treeFactory.updateDraft(draft);
      renderSpecies();
      renderControls();
      buildTree();
      event.target.value = "";
    });

    addEventListener("resize", resize);
  }

  function buildTree() {
    clearTimeout(rebuildTimer);
    const started = performance.now();
    disposeCurrent();

    const request = engine.n.treeFactory.createBuildRequest();
    const treeDescriptor = engine.n.proceduralTree.generate(request.tree);
    const objectDescriptor = engine.n.coreObject.register(treeDescriptor.objectDescriptor);

    const pbrFields = engine.n.proceduralTreePbr.generate(
      treeDescriptor,
      { textureSize: request.tree.preset.materials.textureSize }
    );

    const treeLodDescriptor = engine.n.treeLod.register(
      treeDescriptor,
      request.lod
    );

    const objectMaterial = engine.n.proceduralObjectMaterial.create({
      objectId: objectDescriptor.id,
      family: "tree-factory-pbr",
      fields: pbrFieldMetadata(pbrFields),
      metadata: {
        treeHash: treeDescriptor.hash,
        pbrHash: pbrFields.hash
      }
    });

    const objectLod = engine.n.proceduralObjectLod.create({
      objectId: objectDescriptor.id,
      sources: treeLodDescriptor.estimatedTriangles.map((entry) => ({
        level: entry.level,
        type: entry.type,
        descriptorId: `${objectDescriptor.id}:lod:${entry.level}`,
        triangleBudget: entry.triangles
      })),
      distances: [
        treeLodDescriptor.distances.lod1,
        treeLodDescriptor.distances.lod2,
        treeLodDescriptor.distances.impostor
      ],
      captureSourceLevel: 0,
      metadata: { treeLodHash: treeLodDescriptor.hash }
    });

    const captureProfile = engine.n.proceduralObjectCaptureProfile.create({
      objectId: objectDescriptor.id,
      pivot: objectDescriptor.pivot,
      groundAnchor: objectDescriptor.groundAnchor,
      ...request.capture
    });

    const capturePlan = createCapturePlan(captureProfile);

    const renderAsset = treeRenderer.buildAsset({
      id: objectDescriptor.id,
      treeDescriptor,
      objectDescriptor,
      pbrFields,
      lodDescriptor: treeLodDescriptor,
      captureProfile
    });

    renderAsset.root.traverse((object) => {
      if (!object.isMesh) return;
      object.receiveShadow = true;
      object.castShadow = object !== renderAsset.billboard;
    });

    scene.add(renderAsset.root);

    current = {
      request,
      treeDescriptor,
      objectDescriptor,
      pbrFields,
      treeLodDescriptor,
      objectMaterial,
      objectLod,
      captureProfile,
      capturePlan,
      renderAsset,
      activeFrameIndex: 0
    };

    engine.n.coreObject.setLifecycle(objectDescriptor.id, "active");
    fitCamera(objectDescriptor);
    updateBoundsHelper();
    updateAtlasPreview();
    updateCaptureGrid();
    updateStats(performance.now() - started);
    updateObjectPreview();

    engine.n.treeFactory.recordGeneration({
      id: objectDescriptor.id,
      objectHash: objectDescriptor.contentHash,
      treeHash: treeDescriptor.hash,
      branches: treeDescriptor.stats.branchCount,
      leaves: treeDescriptor.stats.leafCount,
      buildMilliseconds: performance.now() - started
    });
  }

  function disposeCurrent() {
    if (!current) return;
    treeRenderer.disposeAsset(current.renderAsset);
    engine.n.coreObject.remove(current.objectDescriptor.id);
    engine.n.proceduralObjectMaterial.remove(current.objectDescriptor.id);
    engine.n.proceduralObjectLod.remove(current.objectDescriptor.id);
    engine.n.proceduralObjectCaptureProfile.remove(current.objectDescriptor.id);
    current = null;
    if (boundsHelper) {
      boundsHelper.removeFromParent();
      boundsHelper.geometry.dispose();
      boundsHelper.material.dispose();
      boundsHelper = null;
    }
  }

  function fitCamera(objectDescriptor) {
    const pivot = new THREE.Vector3(...objectDescriptor.pivot);
    const radius = Math.max(1, objectDescriptor.bounds.radius);
    const direction = new THREE.Vector3(1, 0.38, 1).normalize();

    controls.target.copy(pivot);
    camera.position.copy(pivot).addScaledVector(direction, radius * 2.65);
    controls.minDistance = Math.max(2, radius * 0.75);
    controls.maxDistance = Math.max(20, radius * 6);
    camera.near = Math.max(0.03, radius / 120);
    camera.far = Math.max(250, radius * 36);
    camera.updateProjectionMatrix();
    controls.update();

    ground.position.y = objectDescriptor.groundAnchor[1] - 0.02;
    ground.scale.setScalar(Math.max(8, radius * 2.15));
  }

  function updateBoundsHelper() {
    if (boundsHelper) {
      boundsHelper.removeFromParent();
      boundsHelper.geometry.dispose();
      boundsHelper.material.dispose();
    }
    const bounds = current.objectDescriptor.bounds;
    const box = new THREE.Box3(
      new THREE.Vector3(...bounds.min),
      new THREE.Vector3(...bounds.max)
    );
    boundsHelper = new THREE.Box3Helper(box);
    boundsHelper.visible = elements.showBounds.checked;
    scene.add(boundsHelper);
  }

  function updateBoundsVisibility() {
    if (boundsHelper) boundsHelper.visible = elements.showBounds.checked;
  }

  function updateAtlasPreview() {
    const canvas = current.renderAsset.atlas.canvas;
    const preview = elements.atlasPreview;
    preview.width = canvas.width;
    preview.height = canvas.height;
    const context = preview.getContext("2d");
    context.clearRect(0, 0, preview.width, preview.height);
    context.drawImage(canvas, 0, 0);
    elements.captureStatus.textContent =
      `${current.capturePlan.frames.length} frames · ${canvas.width}px`;
  }

  function updateCaptureGrid() {
    elements.captureGrid.replaceChildren();
    for (const frame of current.capturePlan.frames) {
      const cell = document.createElement("div");
      cell.className = `capture-cell${frame.frameIndex === current.activeFrameIndex ? " active" : ""}`;
      cell.dataset.frameIndex = String(frame.frameIndex);
      cell.textContent = `${Math.round(frame.azimuthDegrees)}° / ${Math.round(frame.elevationDegrees)}°`;
      elements.captureGrid.append(cell);
    }
  }

  function updateActiveCaptureCell(frameIndex) {
    if (!current || current.activeFrameIndex === frameIndex) return;
    current.activeFrameIndex = frameIndex;
    for (const cell of elements.captureGrid.children) {
      cell.classList.toggle(
        "active",
        Number(cell.dataset.frameIndex) === frameIndex
      );
    }
  }

  function updateStats(buildMilliseconds) {
    const entries = [
      ["Species", current.request.tree.preset.species],
      ["Object hash", current.objectDescriptor.contentHash],
      ["Tree hash", current.treeDescriptor.hash],
      ["Branches", current.treeDescriptor.stats.branchCount],
      ["Leaves", current.treeDescriptor.stats.leafCount],
      ["Curve points", current.treeDescriptor.stats.pointCount],
      ["LOD0 triangles", current.treeLodDescriptor.estimatedTriangles[0].triangles],
      ["LOD1 triangles", current.treeLodDescriptor.estimatedTriangles[1].triangles],
      ["LOD2 triangles", current.treeLodDescriptor.estimatedTriangles[2].triangles],
      ["Atlas frames", current.capturePlan.frames.length],
      ["Build", `${Math.round(buildMilliseconds)} ms`]
    ];

    elements.buildStats.replaceChildren();
    for (const [label, value] of entries) {
      const term = document.createElement("dt");
      term.textContent = label;
      const definition = document.createElement("dd");
      definition.textContent = String(value);
      elements.buildStats.append(term, definition);
    }
  }

  function updateObjectPreview() {
    elements.objectPreview.textContent = JSON.stringify({
      object: current.objectDescriptor,
      material: current.objectMaterial,
      lod: current.objectLod,
      captureProfile: current.captureProfile
    }, null, 2);
  }

  function frame() {
    const delta = Math.min(clock.getDelta(), 0.05);
    controls.update();
    engine.tick(delta);

    if (current) {
      if (elements.rotateTree.checked) {
        current.renderAsset.root.rotation.y += delta * 0.22;
      }

      const state = treeRenderer.updateAsset(
        current.renderAsset,
        camera,
        elements.lodMode.value
      );

      updateActiveCaptureCell(state.frameIndex);
      elements.viewportStatus.textContent =
        `LOD${state.activeLevel} · ${state.distance.toFixed(1)} m · ` +
        `frame ${state.frameIndex} · ${current.objectDescriptor.id}`;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  function resize() {
    const rect = elements.viewport.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  function patchDraft(path, value) {
    const patch = {};
    setByPath(patch, path, value);
    engine.n.treeFactory.updateDraft(patch);
  }

  function scheduleBuild() {
    if (!elements.autoBuild.checked) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(buildTree, 180);
  }

  function ensureCurrent() {
    if (!current) throw new Error("Generate a tree before exporting.");
  }
} catch (error) {
  fail(error);
}

function createControlInput(control, value) {
  const input = document.createElement(control.type === "select" ? "select" : "input");

  if (control.type === "select") {
    for (const [optionValue, label] of control.options) {
      const option = document.createElement("option");
      option.value = String(optionValue);
      option.textContent = label;
      option.selected = String(optionValue) === String(value);
      input.append(option);
    }
    return input;
  }

  input.type = control.type;
  input.value = String(value);
  if (control.type === "range") {
    input.min = String(control.min);
    input.max = String(control.max);
    input.step = String(control.step);
  }
  return input;
}

function readControlValue(input, control) {
  if (control.type === "color") return input.value;
  if (control.type === "range") return Number(input.value);
  const numeric = control.options?.every(([value]) => typeof value === "number");
  return numeric ? Number(input.value) : input.value;
}

function formatControlValue(value, unit = "") {
  const number = Number(value);
  const formatted = Number.isInteger(number) ? String(number) : number.toFixed(2);
  return `${formatted}${unit}`;
}

function getByPath(value, path) {
  return path.split(".").reduce((current, key) => current?.[key], value);
}

function setByPath(target, path, value) {
  const keys = path.split(".");
  let cursor = target;
  for (const key of keys.slice(0, -1)) {
    cursor[key] ??= {};
    cursor = cursor[key];
  }
  cursor[keys.at(-1)] = value;
}

function pbrFieldMetadata(fieldSet) {
  return Object.fromEntries(
    Object.entries(fieldSet.maps).map(([name, field]) => [
      name,
      {
        id: field.id,
        hash: field.hash,
        semantic: field.semantic,
        colorSpace: field.colorSpace,
        width: field.width,
        height: field.height
      }
    ])
  );
}

function fail(error) {
  const message = error instanceof Error ? error.message : String(error);
  elements.fatalMessage.textContent = message;
  elements.fatal.hidden = false;
  console.error(error);
}
