# Chapter 5: Testing and Real-LLM Evals

## Why Two Validation Layers

AI systems need both deterministic testing and behavioral evaluation.

- Unit tests verify deterministic logic
- Real-LLM evals verify runtime behavior under actual model responses

## Unit Tests in This Project

Examples include:

- Calculator function tests
- Math-intent detection tests

## Eval Harness in This Project

The eval harness in scripts/eval-chat.mjs calls the live /api/chat route and checks:

- Tool-backed math outputs
- No false tool-denial responses
- Non-math response quality sanity

## Student Takeaway

Passing unit tests does not guarantee reliable AI behavior. Evals are required to close that gap.
