#!/usr/bin/env node

const baseUrl = process.env.EVAL_BASE_URL ?? "http://localhost:3000";
const endpoint = `${baseUrl.replace(/\/$/, "")}/api/chat`;

const toolDenialPattern =
  /(don['’]t have.*tool|cannot.*tool|can't.*tool|no tool.*connected|unable to invoke tools)/i;

/**
 * @typedef {{ role: "user" | "assistant", content: string }} ChatMessage
 * @typedef {{ ok: boolean, status: number, payload: any }} ChatResponse
 */

/**
 * @param {ChatMessage[]} messages
 * @returns {Promise<ChatResponse>}
 */
async function callChat(messages) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = { error: "Non-JSON response from API route." };
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

/**
 * @param {string} reply
 */
function parseNumericResult(reply) {
  const match = reply.match(/result:\s*(-?\d+(?:\.\d+)?)/i);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

const evalCases = [
  {
    name: "Math expression routes through tool",
    messages: [{ role: "user", content: "what is 14 + 8?" }],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      const number = parseNumericResult(reply);

      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }

      if (number !== 22) {
        return `Expected tool-backed result 22, got reply: ${reply}`;
      }

      return null;
    },
  },
  {
    name: "Conversational add routes through tool",
    messages: [{ role: "user", content: "please add 41 and 1" }],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");
      const number = parseNumericResult(reply);

      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }

      if (number !== 42) {
        return `Expected tool-backed result 42, got reply: ${reply}`;
      }

      return null;
    },
  },
  {
    name: "Use-tool follow-up never claims tools unavailable",
    messages: [
      { role: "user", content: "what is 2 + 2?" },
      { role: "assistant", content: "Result: 4" },
      { role: "user", content: "use the tool" },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "");

      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }

      if (toolDenialPattern.test(reply)) {
        return `Reply incorrectly denied tool access: ${reply}`;
      }

      if (!/tool|calculate|result/i.test(reply)) {
        return `Reply should reference tool-backed math behavior, got: ${reply}`;
      }

      return null;
    },
  },
  {
    name: "Non-math prompt still works with real LLM",
    messages: [
      { role: "user", content: "Write one short sentence about teamwork." },
    ],
    validate: (result) => {
      const reply = String(result.payload?.reply ?? "").trim();

      if (!result.ok) {
        return `Expected 200 response, got ${result.status} with ${JSON.stringify(result.payload)}`;
      }

      if (reply.length < 12) {
        return `Expected meaningful LLM text, got: ${reply}`;
      }

      if (toolDenialPattern.test(reply)) {
        return `Non-math response denied tool access unexpectedly: ${reply}`;
      }

      return null;
    },
  },
];

async function run() {
  const preflight = await fetch(baseUrl).catch(() => null);

  if (!preflight) {
    console.error(
      `❌ Dev server not reachable at ${baseUrl}. Start it with: npm run dev`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Running real-LLM eval harness against ${endpoint}`);

  let passed = 0;

  for (const evalCase of evalCases) {
    try {
      const result = await callChat(evalCase.messages);
      const failure = evalCase.validate(result);

      if (failure) {
        console.error(`❌ ${evalCase.name}`);
        console.error(`   ${failure}`);
      } else {
        passed += 1;
        console.log(`✅ ${evalCase.name}`);
      }
    } catch (error) {
      console.error(`❌ ${evalCase.name}`);
      console.error(
        `   ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  console.log(`\n${passed}/${evalCases.length} evals passed.`);

  if (passed !== evalCases.length) {
    process.exitCode = 1;
  }
}

await run();
