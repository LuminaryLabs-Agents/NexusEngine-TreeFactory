# AGENTS.md

NexusEngine-TreeFactory is a kit-composed procedural-tree laboratory.

## Required workflow

```txt
Read .agent/START_HERE.md.
Find the owning domain.
Reuse NexusEngine contracts before creating local behavior.
Keep tree meaning separate from Three.js objects.
Keep application state serializable.
Validate before claiming.
Update docs and tests with behavior.
Push only to main unless the user explicitly requests otherwise.
Do not create pull requests or extra branches.
```

## Ownership

```txt
TreeFactory domain
  species presets
  editable drafts
  build/export ledgers
  lab-specific capture diagnostics

NexusEngine core-object-kit
  universal object identity and lifecycle

NexusEngine-Kits procedural-objects
  material, LOD, and capture-profile descriptors

Procedural tree ProtoKits
  tree morphology, PBR fields, tree LOD, snapshots

Three.js adapter
  GPU geometry, textures, atlas rendering, GLB export
```

Do not move DOM, Canvas, Three.js, WebGL, download, or browser input behavior into renderer-neutral domain modules.
