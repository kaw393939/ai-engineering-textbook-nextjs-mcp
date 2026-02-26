import path from "path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type CalculatorOperation = "add" | "subtract" | "multiply" | "divide";

type CallToolResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

let clientPromise: Promise<Client> | null = null;

async function createClient(): Promise<Client> {
  const client = new Client({
    name: "is219-nextjs-mcp-client",
    version: "1.0.0",
  });

  const serverPath = path.join(
    process.cwd(),
    "mcp-server",
    "calculator-server.mjs"
  );

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
  });

  await client.connect(transport);
  return client;
}

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = createClient();
  }

  return clientPromise;
}

export async function callCalculatorTool(
  operation: CalculatorOperation,
  firstNumber: number,
  secondNumber: number
): Promise<number> {
  const client = await getClient();

  const response = (await client.callTool({
    name: operation,
    arguments: {
      a: firstNumber,
      b: secondNumber,
    },
  })) as CallToolResponse;

  const text = response.content?.find((item) => item.type === "text")?.text;

  if (!text) {
    throw new Error("MCP calculator server returned no result.");
  }

  const result = Number(text);

  if (Number.isNaN(result)) {
    throw new Error("MCP calculator server returned a non-numeric result.");
  }

  return result;
}
