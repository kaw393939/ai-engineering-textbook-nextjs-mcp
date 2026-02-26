export type MathOperation = "add" | "subtract" | "multiply" | "divide";

export type MathIntent = {
  operation: MathOperation;
  firstNumber: number;
  secondNumber: number;
};

const arithmeticExpressionPattern =
  /(-?\d+(?:\.\d+)?)\s*([+\-*/x])\s*(-?\d+(?:\.\d+)?)/i;

function normalizeInput(input: string): string {
  return input.toLowerCase().replace(/[?!,]/g, " ").replace(/\s+/g, " ").trim();
}

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function detectMathIntent(input: string): MathIntent | null {
  const text = normalizeInput(input);

  let match = text.match(arithmeticExpressionPattern);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[3]);
    const operator = match[2];

    if (firstNumber !== null && secondNumber !== null) {
      if (operator === "+") {
        return { operation: "add", firstNumber, secondNumber };
      }

      if (operator === "-") {
        return { operation: "subtract", firstNumber, secondNumber };
      }

      if (operator === "*" || operator === "x") {
        return { operation: "multiply", firstNumber, secondNumber };
      }

      if (operator === "/") {
        return { operation: "divide", firstNumber, secondNumber };
      }
    }
  }

  match = text.match(/^(-?\d+(?:\.\d+)?)\s*\+\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "add", firstNumber, secondNumber };
    }
  }

  match = text.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "subtract", firstNumber, secondNumber };
    }
  }

  match = text.match(/^(-?\d+(?:\.\d+)?)\s*(?:\*|x)\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "multiply", firstNumber, secondNumber };
    }
  }

  match = text.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "divide", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /^(?:add|sum)\s+(-?\d+(?:\.\d+)?)\s+(?:and|to)\s+(-?\d+(?:\.\d+)?)$/
  );
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "add", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /(?:add|sum|plus)\s+(-?\d+(?:\.\d+)?)\s+(?:and|to)\s+(-?\d+(?:\.\d+)?)/
  );
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "add", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /^subtract\s+(-?\d+(?:\.\d+)?)\s+from\s+(-?\d+(?:\.\d+)?)$/
  );
  if (match) {
    const secondNumber = parseNumber(match[1]);
    const firstNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "subtract", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /(?:subtract|minus)\s+(-?\d+(?:\.\d+)?)\s+from\s+(-?\d+(?:\.\d+)?)/
  );
  if (match) {
    const secondNumber = parseNumber(match[1]);
    const firstNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "subtract", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /^multiply\s+(-?\d+(?:\.\d+)?)\s+(?:by|and)\s+(-?\d+(?:\.\d+)?)$/
  );
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "multiply", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /(?:multiply|times)\s+(-?\d+(?:\.\d+)?)\s+(?:by|and)\s+(-?\d+(?:\.\d+)?)/
  );
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "multiply", firstNumber, secondNumber };
    }
  }

  match = text.match(/^divide\s+(-?\d+(?:\.\d+)?)\s+by\s+(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "divide", firstNumber, secondNumber };
    }
  }

  match = text.match(
    /(?:divide|divided by)\s+(-?\d+(?:\.\d+)?)\s+by\s+(-?\d+(?:\.\d+)?)/
  );
  if (match) {
    const firstNumber = parseNumber(match[1]);
    const secondNumber = parseNumber(match[2]);
    if (firstNumber !== null && secondNumber !== null) {
      return { operation: "divide", firstNumber, secondNumber };
    }
  }

  return null;
}

export function detectMathRelated(input: string): boolean {
  const text = normalizeInput(input);

  if (detectMathIntent(text)) {
    return true;
  }

  if (arithmeticExpressionPattern.test(text)) {
    return true;
  }

  return /(\badd\b|\bsum\b|\bplus\b|\bsubtract\b|\bminus\b|\bmultiply\b|\btimes\b|\bdivide\b|\bdivided\b|\bmath\b|\barithmetic\b|\bcalculate\b)/i.test(
    text
  );
}
