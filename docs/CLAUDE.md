# CLAUDE.md: Smart To-Do & Task Manager

You are implementing the Smart To-Do & Task Manager described in the docs. Read these first, in order: `README.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API_SPEC.md`, `FRONTEND.md`, `SETUP.md`, `IMPLEMENTATION_PLAN.md`.

## Hard constraints
- **No Docker, no docker-compose.** MongoDB runs natively on macOS (Homebrew).
- **API port is 5001, never 5000** (macOS AirPlay occupies 5000). Client is on 5173 with a Vite proxy for `/api`.
- Stack is fixed: Node/Express/Mongoose and React (Vite) with Tailwind. Plain JavaScript (no TypeScript) unless told otherwise.
- All features in `PRD.md` must be implemented: task CRUD, categories, priority tags, search and filters, local persistence with an offline queue, smart groups, and stats.

## Working rules
- Follow `IMPLEMENTATION_PLAN.md` phase by phase. Finish and verify each phase's "Done when" check before moving on, and tick the checkboxes as you go.
- Match the API contract in `API_SPEC.md` exactly (paths, query params, response and error shapes).
- Keep controllers thin, put query logic in `utils/buildTaskQuery.js`, wrap async handlers, validate every input with express-validator.
- Frontend: filters live in the URL, all mutations are optimistic with rollback, and offline writes go through `syncQueue`.
- Use `clientId` for idempotent creates so queue replays never duplicate tasks.
- Do not add dependencies beyond those listed in `SETUP.md` without a clear reason.
- After each phase, run the app and test the endpoints/UI; fix errors before continuing.

## Kickoff prompt
> Read all docs in `/docs`. Start at Phase 0 of `IMPLEMENTATION_PLAN.md` and work through every phase in order. After each phase, run it, verify the "Done when" criteria, and summarize what you built before continuing. Keep the API on port 5001 and do not use Docker.
