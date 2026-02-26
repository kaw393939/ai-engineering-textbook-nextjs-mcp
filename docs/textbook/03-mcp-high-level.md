# Chapter 3: MCP at a High Level

## What Is MCP

MCP stands for Model Context Protocol. It is an open protocol for connecting models to tools and external context in a standardized way.

## Who Made It

MCP was introduced by Anthropic as an open protocol and is now used across a growing ecosystem.

## Why MCP Matters

Without a tool protocol, AI apps often rely on fragile, custom glue code. MCP improves:

- Interoperability
- Maintainability
- Clear boundaries between model and tools

## MCP in This Project

- MCP server provides calculator tools
- MCP client in the app calls the server tools
- Chat orchestration decides when and how tools are called

## Key Concept for Students

Prompt instructions are not enough. Reliable tool usage requires explicit orchestration and enforcement logic.
