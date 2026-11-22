import { describe, expect, it } from "vitest";
import { MERMAID_SECURITY_LEVEL } from "../src/renderer/editor/code-block";

describe("mermaid security", () => {
  it("renders untrusted diagrams in strict mode", () => {
    expect(MERMAID_SECURITY_LEVEL).toBe("strict");
  });
});
