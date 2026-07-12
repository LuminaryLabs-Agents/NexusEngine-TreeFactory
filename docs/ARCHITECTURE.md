# Architecture

## Core distinction

```txt
Entity
  world identity and gameplay state

Object
  generated or imported physical asset structure

Renderer object
  live Three.js meshes, materials, textures, skeletons, and GPU resources
```

TreeFactory edits tree meaning and requests object generation. It does not redefine the universal object contract or the procedural tree generator.

## Domain graph

```txt
n:object
└── n:object:procedural
    └── n:object:procedural:tree
        └── n:object:procedural:tree:factory
```

## Data flow

```txt
TreeFactory species preset
→ editable TreeFactory draft
→ deterministic tree build request
→ procedural tree descriptor
→ nexus-object-descriptor/1
→ procedural object material/LOD/capture descriptors
→ Three.js tree render asset
→ GLB / JSON / PNG export
```

## Capture

TreeFactory owns a renderer-neutral capture plan containing:

```txt
canonical pivot
ground anchor
azimuth/elevation views
atlas cells
framing intent
```

The current tree adapter performs GPU capture. The planned generic capture adapter will consume the same plan and return per-view projected framing metadata.
