export function add(first: number, second: number): number {
  return first + second;
}

export function subtract(first: number, second: number): number {
  return first - second;
}

export function multiply(first: number, second: number): number {
  return first * second;
}

export function divide(first: number, second: number): number {
  if (second === 0) {
    throw new Error("Cannot divide by zero");
  }

  return first / second;
}
