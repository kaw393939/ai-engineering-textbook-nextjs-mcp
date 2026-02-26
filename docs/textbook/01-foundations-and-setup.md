# Chapter 1: Foundations and Course Setup

## Purpose

This course teaches students to build an AI-enabled web app that is not only functional, but reliable and testable.

## Learning Outcomes

By the end of this project, students can:

- Explain the role of Next.js in full-stack AI applications
- Explain what MCP is and why tool protocols matter
- Build a chat backend that can call tools safely
- Validate behavior with unit tests and real-LLM evals

## Course Mental Model

Use this sequence throughout the course:

1. Build a baseline feature.
1. Add tool capability.
1. Enforce behavior server-side.
1. Verify with tests and evals.

## Setup Checklist

1. Install dependencies:

```bash
npm install
```

1. Set environment values:

```bash
cp .env.example .env.local
```

1. Start app:

```bash
npm run dev
```

1. Run evals:

```bash
npm run eval:chat
```
