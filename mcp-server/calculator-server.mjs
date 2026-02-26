import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "is219-calculator-mcp",
  version: "1.0.0",
});

server.registerTool(
  "add",
  {
    title: "Add",
    description: "Add two numbers.",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

server.registerTool(
  "subtract",
  {
    title: "Subtract",
    description: "Subtract second number from first number.",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a - b) }],
  })
);

server.registerTool(
  "multiply",
  {
    title: "Multiply",
    description: "Multiply two numbers.",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a * b) }],
  })
);

server.registerTool(
  "divide",
  {
    title: "Divide",
    description: "Divide first number by second number.",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
  },
  async ({ a, b }) => {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }

    return {
      content: [{ type: "text", text: String(a / b) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
