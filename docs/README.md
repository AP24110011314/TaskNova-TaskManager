# Smart To-Do & Task Manager

A MERN task manager with categories, priority tags, powerful search/filters, and local persistence (localStorage cache + offline queue) backed by MongoDB and a REST API.

## Docs index (read in this order)
| File | Purpose |
|---|---|
| `PRD.md` | Scope, features, acceptance criteria |
| `ARCHITECTURE.md` | Stack, folder structure, data flow, sync design |
| `DATABASE.md` | Mongoose schemas, indexes, seed data |
| `API_SPEC.md` | Every REST endpoint with request/response examples |
| `FRONTEND.md` | Components, hooks, state, UI behavior |
| `SETUP.md` | macOS setup with no Docker, env files, ports |
| `IMPLEMENTATION_PLAN.md` | Phase-by-phase build checklist |
| `CLAUDE.md` | Agent instructions; drop in the repo root for Claude Code |

## Fixed decisions
- **No Docker.** MongoDB runs natively via Homebrew.
- **API port: 5001** (macOS uses 5000 for AirPlay Receiver). **Client port: 5173.**
- **Stack:** Node.js 18+, Express, Mongoose, React 18 + Vite, Axios, Tailwind CSS.
