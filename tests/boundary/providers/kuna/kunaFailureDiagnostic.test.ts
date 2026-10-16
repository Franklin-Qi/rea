import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { kunaFailureDiagnostic } from "../../../../src/kuna/KunaCommand.js";

describe("kunaFailureDiagnostic", () => {
  it("falls back to the cause when stderr is empty after trim", () => {
    const cause = new Error(
      "Command failed; inspect its exit status and diagnostics.",
    );
    assert.equal(kunaFailureDiagnostic("", cause), cause.message);
    assert.equal(kunaFailureDiagnostic("\n", cause), cause.message);
    assert.equal(kunaFailureDiagnostic(undefined, cause), cause.message);
  });

  it("keeps the last nonempty stderr line when present", () => {
    const cause = new Error(
      "Command failed; inspect its exit status and diagnostics.",
    );
    assert.equal(kunaFailureDiagnostic("diagnostic\n", cause), "diagnostic");
    assert.equal(kunaFailureDiagnostic("first\nlast", cause), "last");
  });
});
