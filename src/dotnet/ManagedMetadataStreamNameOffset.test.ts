import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { inspectManagedArtifactBytes } from "./ManagedArtifactInspector.js";
import {
  buildManagedPeFixture,
  managedPeFixtureTarget,
} from "./ManagedPe.fixture.js";
import { readManagedPeLayout } from "./ManagedPeReader.js";

describe("managed metadata stream-name coordinates", () => {
  it("retains artifact file offsets for malformed stream names", () => {
    const valid = buildManagedPeFixture();
    const pe = readManagedPeLayout(valid);
    assert.ok(pe.cli);
    const root = pe.rvaToOffset(
      pe.cli.metadata.rva,
      pe.cli.metadata.size,
      "cli.metadata",
    );
    const relative =
      Math.ceil((16 + valid.readUInt32LE(root + 12)) / 4) * 4 + 12;
    const expected = root + relative;
    assert.deepEqual(
      inspectManagedArtifactBytes(valid, managedPeFixtureTarget(valid))
        .coverage,
      { state: "complete", issues: [] },
    );
    for (const mode of ["non-printable", "unterminated"] as const) {
      const bytes = Buffer.from(valid);
      if (mode === "non-printable") bytes[expected] = 1;
      else bytes.fill(0x41, expected, expected + 32);
      const result = inspectManagedArtifactBytes(
        bytes,
        managedPeFixtureTarget(bytes),
      );
      assert.equal(result.classification.evidence[0]?.file_offset, expected);
      assert.equal(result.coverage.state, "partial");
      assert.equal(result.coverage.issues[0]?.scope, "metadata.stream-name");
      assert.equal(result.coverage.issues[0]?.offset, expected);
    }
  });
});
