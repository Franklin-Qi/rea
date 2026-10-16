import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createBrowserEvidence } from "./BrowserEvidence.js";
import type { AnalyzeWebBundleInput } from "../domain/webBundleAnalysis.js";
import type { WebBundleAnalysis } from "../domain/webBundleAnalysis.js";

const endpoint = {
  transport: "http_discovery" as const,
  url: "http://127.0.0.1:9222",
  recorded: "http://127.0.0.1:9222",
};

const bundleInput = (
  allowed_origins: string[],
): AnalyzeWebBundleInput =>
  ({
    cdp_endpoint: endpoint,
    target_id: "page-1",
    allowed_origins,
    observation_ms: 500,
    include_accessibility_text: false,
    include_console_text: false,
    include_json_body_shapes: false,
    include_websocket_shapes: false,
    include_storage_keys: false,
    include_storage_fingerprints: false,
    include_script_sources: false,
    fetch_source_maps: false,
  }) as unknown as AnalyzeWebBundleInput;

const bundleResult = {
  capture: { target_url: "https://example.test/app" },
  limitations: [],
} as unknown as WebBundleAnalysis;

describe("createBrowserEvidence analyze_web_bundle origins", () => {
  it("records the capture target origin when allowed_origins default to empty", () => {
    const evidence = createBrowserEvidence(
      "analyze_web_bundle",
      bundleInput([]),
      bundleResult,
      { id: "fixture", name: "fixture", version: "1" },
    );
    assert.deepEqual(evidence.parameters.allowed_origins, [
      "https://example.test",
    ]);
  });

  it("preserves an explicit nonempty allowed_origins list", () => {
    const evidence = createBrowserEvidence(
      "analyze_web_bundle",
      bundleInput(["https://allowed.example"]),
      bundleResult,
      { id: "fixture", name: "fixture", version: "1" },
    );
    assert.deepEqual(evidence.parameters.allowed_origins, [
      "https://allowed.example",
    ]);
  });
});
