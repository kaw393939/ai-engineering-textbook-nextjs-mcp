# AI Engineering Textbook: Next.js and MCP

<!-- portfolio-curation -->
## Portfolio Overview
Course-style project for teaching students how to build, evaluate, and improve AI web applications with Next.js and MCP tools.

## What This Demonstrates
- AI engineering pedagogy
- applied assignments
- modern web architecture

## Stack
TypeScript, Next.js, MCP

## Portfolio Status
This repository is part of Keith Williams' curated public portfolio. The README has been updated to explain the project purpose, technical focus, and why the work is worth reviewing.
<!-- /portfolio-curation -->

---

## Original Notes

# IS219 AI Engineering Textbook Project

This repository is a course-style project that teaches students how to build, evaluate, and improve an AI web application with Next.js and MCP tools.

Use this README as the course introduction and index, then read each chapter in order.

## What Students Learn

- How modern full-stack apps are built with Next.js
- How LLM agents call external tools through MCP
- Why backend enforcement matters more than prompt text alone
- How to use both unit tests and real-LLM evals
- How requirements evolve through iterative human direction
- How to work with AI agents without offloading core human judgment

## Who Made These Technologies

- Next.js is created and maintained by Vercel, with broad open-source community contributions.
- MCP (Model Context Protocol) was introduced by Anthropic as an open protocol for connecting models to tools and data sources.

## Why This Project Exists

Students often see AI demos that look impressive but are hard to trust in production. This project teaches a practical path:

1. Build a working app.
1. Add tool integrations.
1. Enforce reliability at the server level.
1. Prove behavior with evals.

## Textbook Chapters

- [Chapter 1: Foundations and Course Setup](docs/textbook/01-foundations-and-setup.md)
- [Chapter 2: Next.js at a High Level](docs/textbook/02-nextjs-high-level.md)
- [Chapter 3: MCP at a High Level](docs/textbook/03-mcp-high-level.md)
- [Chapter 4: System Architecture Walkthrough](docs/textbook/04-system-architecture.md)
- [Chapter 5: Testing and Real-LLM Evals](docs/textbook/05-testing-and-evals.md)
- [Chapter 6: Prompting, Direction, and Iteration](docs/textbook/06-direction-and-iteration.md)
- [Chapter 7: Assignment Instructions and Rubric](docs/textbook/07-assignment-and-rubric.md)
- [Chapter 8: A Direct Note from GPT-5.3-Codex](docs/textbook/08-direct-note-from-gpt-5.3-codex.md)

## Quick Start

1. Install dependencies.

```bash
npm install
```

1. Create local environment file.

```bash
cp .env.example .env.local
```

1. Set one provider key in .env.local.

- OPENAI_API_KEY, or
- ANTHROPIC_API_KEY

1. Start the app.

```bash
npm run dev
```

1. Run the real-LLM eval harness.

```bash
npm run eval:chat
```

## Core Commands

- npm run dev
- npm run build
- npm run test
- npm run eval:chat
- npm run lint
- npm run typecheck

## Repository Guide

- [src/app/page.tsx](src/app/page.tsx): homepage entry
- [src/components/chat/chat-client.tsx](src/components/chat/chat-client.tsx): chat interface
- [src/app/api/chat/route.ts](src/app/api/chat/route.ts): chat backend orchestration
- [mcp-server/calculator-server.mjs](mcp-server/calculator-server.mjs): MCP calculator server
- [src/lib/mcp-calculator-client.ts](src/lib/mcp-calculator-client.ts): MCP client wrapper
- [scripts/eval-chat.mjs](scripts/eval-chat.mjs): real-LLM eval harness

## Teaching Note

This project is intentionally iterative. Students should expect to revise architecture as requirements become stricter. That is not failure; it is professional engineering.

