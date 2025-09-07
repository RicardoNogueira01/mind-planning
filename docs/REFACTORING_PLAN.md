# MindMap.jsx Refactoring Plan

Goal: Gradually decompose `src/components/MindMap.jsx` into smaller, tested modules and components without breaking behavior.

## Phase 1 (this change)
- Extracted shape style logic to `src/components/mindmap/getShapeStyles.ts`.
- Added unit tests `src/test/mindmap/getShapeStyles.test.ts`.
- Updated `MindMap.jsx` to import helper.

Why: This isolates a pure function that is easy to test and reduces churn in the monolithic file.

## Verification
- Run tests: `npm run test:run`
- The UI should render the same shapes with standardized sizing.

## Next Candidates
- Connection geometry and path calculation utilities.
- Shape builder registry (drop handlers) into `mindmap/builders.ts`.
- Node toolbar subcomponents (visual group, actions group).
- Progress ring rendering as a discrete component.

## Principles
- Extract pure utilities first and cover with tests.
- Extract leaf UI subcomponents with minimal props contracts.
- Keep functions stable; avoid renaming props/IDs to reduce breakage.
- After each extraction, run tests and perform a brief manual smoke check.
