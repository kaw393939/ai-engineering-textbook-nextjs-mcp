import { add, divide, multiply, subtract } from "./calculator";

describe("calculator", () => {
  it("adds two numbers", () => {
    expect(add(4, 5)).toBe(9);
  });

  it("subtracts two numbers", () => {
    expect(subtract(10, 3)).toBe(7);
  });

  it("multiplies two numbers", () => {
    expect(multiply(6, 7)).toBe(42);
  });

  it("divides two numbers", () => {
    expect(divide(20, 4)).toBe(5);
  });

  it("throws when dividing by zero", () => {
    expect(() => divide(8, 0)).toThrow("Cannot divide by zero");
  });
});
