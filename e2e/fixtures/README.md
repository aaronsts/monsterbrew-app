# Import fixtures

Drop real creature exports here and `import.spec.ts` will turn each one into an
end-to-end test that uploads it through the actual import dialog, saves it, and
validates the persisted creature.

## Adding a fixture

1. Put the JSON file in the folder for its format:

   ```
   e2e/fixtures/
     improved-initiative/   # Improved Initiative exports
     tetra-cube/            # TetraCube exports
     open-5e/               # Open5e (v1 API) creatures
     5e-tools/              # 5eTools bestiary entries
   ```

   The folder name is the format the test expects auto-detection to report, so
   put the file in the right one.

2. Run the tests:

   ```bash
   pnpm test:e2e            # headless
   pnpm test:e2e:ui         # interactive UI mode
   ```

That's it — no code changes. Every file is checked for:

- auto-detection reporting the folder's format,
- a successful import + save,
- the saved creature being a valid `Monster` (schema) with real ability
  scores, a name, and a challenge rating.

## Exact snapshots (optional)

For fixtures where you want to lock the _exact_ converted output, generate a
snapshot alongside the input:

```bash
UPDATE_EXPECTED=1 pnpm test:e2e
```

This writes `<name>.expected.json` next to each `<name>.json`. On later runs the
test deep-equals the conversion against that snapshot, so any drift fails loudly.
Delete the `.expected.json` to go back to schema-only validation, and commit the
snapshot if you want it enforced in CI.
