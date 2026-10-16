import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "vitest";

import { withRegularFile } from "./RegularFileRead.js";

let root: string | undefined;
afterEach(async () => {
  if (root !== undefined) await rm(root, { recursive: true, force: true });
  root = undefined;
});

describe("withRegularFile cancellation", () => {
  it("rejects when cancellation arrives during final metadata checks", async () => {
    root = await mkdtemp(join(tmpdir(), "rea-regular-file-cancel-"));
    const path = join(root, "fixture.txt");
    await writeFile(path, "fixture bytes");
    const controller = new AbortController();
    const reason = new Error("fixture cancellation during final metadata");
    await assert.rejects(
      withRegularFile(
        path,
        async (handle) => {
          const decoded = await handle.readFile({ encoding: "utf8" });
          const originalStat = handle.stat.bind(handle);
          handle.stat = (async () => {
            const metadata = await originalStat();
            controller.abort(reason);
            return metadata;
          }) as typeof handle.stat;
          return decoded;
        },
        { signal: controller.signal },
      ),
      (error) => error === reason,
    );
  });
});
