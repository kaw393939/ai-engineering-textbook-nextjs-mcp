import { detectMathIntent, detectMathRelated } from "./math-intent";

describe("detectMathIntent", () => {
  it("detects arithmetic expression with words around it", () => {
    expect(detectMathIntent("what is 9 + 6?")).toEqual({
      operation: "add",
      firstNumber: 9,
      secondNumber: 6,
    });
  });

  it("detects conversational add request", () => {
    expect(detectMathIntent("please add 41 and 1")).toEqual({
      operation: "add",
      firstNumber: 41,
      secondNumber: 1,
    });
  });

  it("detects divide phrase", () => {
    expect(detectMathIntent("divide 20 by 4")).toEqual({
      operation: "divide",
      firstNumber: 20,
      secondNumber: 4,
    });
  });
});

describe("detectMathRelated", () => {
  it("flags generic math request", () => {
    expect(detectMathRelated("can you calculate this for me?")).toBe(true);
  });

  it("does not flag non-math request", () => {
    expect(detectMathRelated("write me a short bio")).toBe(false);
  });
});
