import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  callCalculatorTool,
  type CalculatorOperation,
} from "@/lib/mcp-calculator-client";
import { detectMathIntent, detectMathRelated } from "@/lib/math-intent";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(30),
});

const calculatorArgumentsSchema = z.object({
  a: z.number(),
  b: z.number(),
});

const calculatorTools = ["add", "subtract", "multiply", "divide"] as const;

function isCalculatorOperation(value: string): value is CalculatorOperation {
  return calculatorTools.includes(value as CalculatorOperation);
}

async function executeCalculatorToolCall(
  toolName: string,
  rawArgs: unknown
): Promise<{ success: boolean; content: string }> {
  if (!isCalculatorOperation(toolName)) {
    return {
      success: false,
      content: `Unsupported calculator tool '${toolName}'.`,
    };
  }

  const parse = calculatorArgumentsSchema.safeParse(rawArgs);

  if (!parse.success) {
    return {
      success: false,
      content: "Calculator tool arguments must include numeric 'a' and 'b'.",
    };
  }

  try {
    const result = await callCalculatorTool(
      toolName,
      parse.data.a,
      parse.data.b
    );

    return {
      success: true,
      content: String(result),
    };
  } catch (error) {
    return {
      success: false,
      content:
        error instanceof Error ? error.message : "MCP calculation failed.",
    };
  }
}

async function runOpenAiToolOrchestratedReply(
  apiKey: string,
  model: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  requiresMathTool: boolean,
  systemPrompt: string
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] =
    calculatorTools.map((name) => ({
      type: "function",
      function: {
        name,
        description: `Perform ${name} on two numbers using calculator MCP tool.`,
        parameters: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number." },
            b: { type: "number", description: "Second number." },
          },
          required: ["a", "b"],
          additionalProperties: false,
        },
      },
    }));

  const initialMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [
      { role: "system", content: systemPrompt },
      ...chatMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

  const firstPass = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: initialMessages,
    tools,
    tool_choice: requiresMathTool ? "required" : "auto",
  });

  const firstMessage = firstPass.choices[0]?.message;
  const toolCalls = firstMessage?.tool_calls ?? [];

  if (toolCalls.length === 0) {
    return firstMessage?.content?.trim() ?? "";
  }

  const assistantToolCallMessage: OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam =
    {
      role: "assistant",
      content: firstMessage?.content ?? null,
      tool_calls: toolCalls,
    };

  const toolResultMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] =
    [];

  for (const toolCall of toolCalls) {
    if (toolCall.type !== "function") {
      continue;
    }

    const rawArgs: unknown = JSON.parse(toolCall.function.arguments || "{}");
    const result = await executeCalculatorToolCall(
      toolCall.function.name,
      rawArgs
    );

    toolResultMessages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: result.content,
    });
  }

  const secondPass = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      ...initialMessages,
      assistantToolCallMessage,
      ...toolResultMessages,
    ],
    tools,
    tool_choice: "auto",
  });

  return secondPass.choices[0]?.message?.content?.trim() ?? "";
}

async function runAnthropicToolOrchestratedReply(
  apiKey: string,
  model: string,
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>,
  requiresMathTool: boolean,
  systemPrompt: string
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const tools = [
    {
      name: "add",
      description: "Perform add on two numbers using calculator MCP tool.",
      input_schema: {
        type: "object" as const,
        properties: {
          a: { type: "number" as const, description: "First number." },
          b: { type: "number" as const, description: "Second number." },
        },
        required: ["a", "b"],
        additionalProperties: false,
      },
    },
    {
      name: "subtract",
      description: "Perform subtract on two numbers using calculator MCP tool.",
      input_schema: {
        type: "object" as const,
        properties: {
          a: { type: "number" as const, description: "First number." },
          b: { type: "number" as const, description: "Second number." },
        },
        required: ["a", "b"],
        additionalProperties: false,
      },
    },
    {
      name: "multiply",
      description: "Perform multiply on two numbers using calculator MCP tool.",
      input_schema: {
        type: "object" as const,
        properties: {
          a: { type: "number" as const, description: "First number." },
          b: { type: "number" as const, description: "Second number." },
        },
        required: ["a", "b"],
        additionalProperties: false,
      },
    },
    {
      name: "divide",
      description: "Perform divide on two numbers using calculator MCP tool.",
      input_schema: {
        type: "object" as const,
        properties: {
          a: { type: "number" as const, description: "First number." },
          b: { type: "number" as const, description: "Second number." },
        },
        required: ["a", "b"],
        additionalProperties: false,
      },
    },
  ];

  const conversation: Anthropic.MessageParam[] = chatMessages.map(
    (message) => ({
      role: message.role,
      content: message.content,
    })
  );

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const completion = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversation,
      tools,
      tool_choice: requiresMathTool ? { type: "any" } : { type: "auto" },
    });

    const textReply = completion.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    const toolUseBlocks = completion.content.filter(
      (block) => block.type === "tool_use"
    );

    if (toolUseBlocks.length === 0) {
      return textReply;
    }

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const result = await executeCalculatorToolCall(block.name, block.input);

        return {
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: result.content,
          is_error: !result.success,
        };
      })
    );

    conversation.push({
      role: "assistant",
      content: completion.content,
    });

    conversation.push({
      role: "user",
      content: toolResults,
    });
  }

  return "";
}

export async function POST(request: Request) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY ?? process.env.API__ANTHROPIC_API_KEY;

  try {
    const json = await request.json();
    const parseResult = bodySchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const chatMessages = parseResult.data.messages;
    const userMessages = chatMessages.filter(
      (message) => message.role === "user"
    );
    const lastUserMessage = [...chatMessages]
      .reverse()
      .find((message) => message.role === "user")?.content;
    const hasPriorMathContext = userMessages.some((message) =>
      detectMathRelated(message.content)
    );

    if (lastUserMessage) {
      const mathIntent = detectMathIntent(lastUserMessage);

      if (mathIntent) {
        try {
          const result = await callCalculatorTool(
            mathIntent.operation,
            mathIntent.firstNumber,
            mathIntent.secondNumber
          );

          return NextResponse.json({
            reply: `Result: ${result}`,
          });
        } catch (mathError) {
          return NextResponse.json(
            {
              error:
                mathError instanceof Error
                  ? mathError.message
                  : "Unable to calculate using MCP server.",
            },
            { status: 500 }
          );
        }
      }

      const asksToUseToolOnly = /\b(use|call|invoke)\b.*\btool\b/i.test(
        lastUserMessage
      );
      const mathRelatedMessage =
        detectMathRelated(lastUserMessage) ||
        (asksToUseToolOnly && hasPriorMathContext);

      if (mathRelatedMessage) {
        return NextResponse.json({
          reply:
            "I will always use the calculator tool for math and will not do arithmetic directly. Please provide the exact calculation, for example 'add 4 and 5' or '12 / 3'.",
        });
      }
    }

    if (!openAiApiKey && !anthropicApiKey) {
      return NextResponse.json(
        {
          error:
            "Missing model API key. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    const systemPrompt =
      "You are a concise, helpful AI assistant integrated into a Next.js web app. You have calculator tools (add, subtract, multiply, divide) and must use them for arithmetic. Never do arithmetic directly in free text. Never claim tools are unavailable.";

    let reply = "";

    if (anthropicApiKey) {
      const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
      reply = await runAnthropicToolOrchestratedReply(
        anthropicApiKey,
        model,
        chatMessages,
        hasPriorMathContext,
        systemPrompt
      );
    } else if (openAiApiKey) {
      const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
      reply = await runOpenAiToolOrchestratedReply(
        openAiApiKey,
        model,
        chatMessages,
        hasPriorMathContext,
        systemPrompt
      );
    }

    if (!reply) {
      return NextResponse.json(
        { error: "The AI response was empty. Please try again." },
        { status: 502 }
      );
    }

    if (
      /(don['’]t have.*tool|cannot.*tool|can't.*tool|no tool.*connected|unable to invoke tools)/i.test(
        reply
      )
    ) {
      reply =
        "I can use the calculator tool for arithmetic. Share the exact calculation, for example 'add 4 and 5' or '12 / 3'.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error in chat route.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
