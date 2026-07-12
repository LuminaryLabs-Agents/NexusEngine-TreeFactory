# Adding a tree species

Add one entry to `TREE_SPECIES` in:

```txt
src/domain/species-presets.js
```

Every species supplies:

```txt
id
label
category
description
tree preset
bark material defaults
leaf material defaults
```

The editable draft is derived from the species preset. The generator remains deterministic for a fixed species, draft, and seed.

After adding a species:

```bash
npm test
npm run build
```
