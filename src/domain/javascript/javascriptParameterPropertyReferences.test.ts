import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { analyzeJavaScriptSemantics } from "./javascriptSemanticAnalysis.js";
import { parseJavaScriptSource } from "./javascriptSourceParser.js";

describe("TypeScript parameter-property references", () => {
  it("does not emit declaration reads for parameter properties", () => {
    for (const [source, count] of [
      ["class C { constructor(public x: number) {} }", 0],
      ["class C { constructor(public x = 1) {} }", 0],
      ["class C { constructor(x: number) {} }", 0],
      ["class C { constructor(x: number) { console.log(x); } }", 1],
      ["const seed = 1; class C { constructor(public x = seed) {} }", 0],
    ] as const) {
      const parsed = parseJavaScriptSource(source, "fixture.ts");
      assert.ok(parsed);
      assert.equal(parsed.errors.length, 0);
      const ir = analyzeJavaScriptSemantics(source);
      const uses = ir.references.filter((reference) => reference.name === "x");
      assert.equal(uses.length, count, source);
      assert.ok(uses.every((reference) => reference.role === "read"));
      if (source.startsWith("const seed")) {
        assert.equal(
          ir.references.filter(
            (reference) =>
              reference.name === "seed" && reference.role === "read",
          ).length,
          1,
        );
      }
    }
  });
});
