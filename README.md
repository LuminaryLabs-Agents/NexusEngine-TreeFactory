# NexusEngine TreeFactory

A public, self-contained browser lab for designing, generating, inspecting, and exporting deterministic game-ready procedural trees with NexusEngine.

## Live lab

After GitHub Pages is enabled by the included workflow, the expected URL is:

```txt
https://luminarylabs-agents.github.io/NexusEngine-TreeFactory/
```

## What it does

- Generates deterministic trees from species presets and editable morphology.
- Uses the NexusEngine core object contract.
- Uses the official procedural-object material, LOD, and capture-profile services.
- Uses the procedural-tree ProtoKits for branch, leaf, PBR, LOD, snapshot, and Three.js adapter behavior.
- Supports Oak, Pine, Birch, Willow, Baobab, Redwood, Acacia, Cypress, Maple, and Deadwood presets.
- Shows LOD0, LOD1, LOD2, impostor, and automatic LOD modes.
- Shows the generated impostor atlas and capture-angle plan.
- Exports the universal object package, editable TreeFactory preset, GLB, and impostor atlas PNG.
- Keeps all app/domain/UI/export code inside this repository.
- Pins NexusEngine dependencies to immutable Git commits.

## Runtime pins

```txt
NexusEngine
d86188c66692d9c24815aa2b29612c70df8fde4e

NexusEngine-Kits
9673594de5669b4691737b91a9d56fa282e74370

NexusEngine-ProtoKits
956fe5431d573079a5f3a46597f89055676f3eab
```

## Architecture

```txt
TreeFactory application domain
├── species preset registry
├── editable draft state
├── deterministic build ledger
├── export ledger
└── capture-plan diagnostics

NexusEngine
├── realtime runtime
├── core-object-kit
└── domain service installation

NexusEngine-Kits
├── seed-kit
└── procedural-objects domain
    ├── procedural-object-body-kit
    ├── procedural-object-material-kit
    ├── procedural-object-lod-kit
    └── procedural-object-capture-profile-kit

NexusEngine-ProtoKits
└── procedural-tree-kits
    ├── procedural-tree-domain-kit
    ├── procedural-tree-pbr-field-kit
    ├── tree-lod-domain-kit
    ├── tree-asset-snapshot-kit
    └── three-tree-render-adapter-kit
```

## Local use

```bash
npm test
npm run build
npm run serve
```

Open `http://localhost:4173`.

## Export formats

```txt
*.tree-factory-preset.json
*.nexus-object.json
*.glb
*-impostor.png
```

## Current capture boundary

The lab already uses one canonical object pivot and ground anchor for runtime selection. The capture-plan domain records all view angles and atlas cells. The current GPU atlas is still baked by the tree-specific Three.js adapter. A future generic `three-object-capture-adapter-kit` can replace that implementation without changing TreeFactory presets or object descriptors.

## License

MIT
