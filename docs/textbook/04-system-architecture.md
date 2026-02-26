# Chapter 4: System Architecture Walkthrough

## End-to-End Flow

1. User sends a chat message from the browser.
1. Next.js API route receives the message.
1. Route determines whether math/tool behavior is required.
1. MCP calculator tool is invoked when needed.
1. LLM response is returned to the chat UI.

## Main Files

- src/components/chat/chat-client.tsx
- src/app/api/chat/route.ts
- src/lib/mcp-calculator-client.ts
- mcp-server/calculator-server.mjs

## Architectural Principle

Keep deterministic operations (like arithmetic) in tools, not in free-form model reasoning. This increases reliability and auditability.

## Security Principle

Provider keys live in environment variables on the server. Never expose them to the client.
