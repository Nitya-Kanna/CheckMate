# AI Parse Gateway Safe (No-risk integration)

This alternative keeps current flow untouched.

## New files

- `src/services/parseBillGatewaySafe.js`
- `src/components/steps/AIParseStepApiGatewaySafe.jsx`

## How to test safely

1. Keep your current `AIParseStep.jsx` as-is.
2. In `BillSplitter.jsx`, temporarily replace import:

```js
import AIParseStep from './steps/AIParseStepApiGatewaySafe'
```

3. Revert to original import if you want:

```js
import AIParseStep from './steps/AIParseStep'
```

## Behavior

- Tries `POST /parse-bill` first
- Fallback to `POST /ai/parse-bill`
- If both fail, fallback to local parser so the UI still works
