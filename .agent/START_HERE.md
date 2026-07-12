# Start Here

## Goal

Maintain a public live web laboratory for editing and exporting many deterministic, game-ready procedural tree types.

## Current source of truth

```txt
src/domain/species-presets.js
src/domain/tree-factory-state.js
src/domain/tree-factory-domain-kit.js
src/domain/capture-plan.js
src/app.js
```

## Validation

```bash
npm test
npm run build
```

## Rules

- Work directly on `main`.
- Keep immutable NexusEngine commit pins in `index.html`.
- Add species through the preset registry.
- Preserve the universal `nexus-object-descriptor/1` output.
- Do not duplicate tree generation or object-contract logic already supplied by NexusEngine repositories.
- Keep GPU capture and rendering behind explicit adapters.
