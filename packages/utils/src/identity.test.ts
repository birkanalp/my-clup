import { describe, it, expect } from "vitest";
import { identity } from "./identity";

describe("identity", () => {
  it("returns the input unchanged", () => {
    expect(identity(1)).toBe(1);
    expect(identity("hello")).toBe("hello");
    expect(identity({ a: 1 })).toEqual({ a: 1 });
  });
});
