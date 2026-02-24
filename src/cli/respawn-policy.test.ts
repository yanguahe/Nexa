import { describe, expect, it } from "vitest";
import { shouldSkipRespawnForArgv } from "./respawn-policy.js";

describe("shouldSkipRespawnForArgv", () => {
  it("skips respawn for help/version calls", () => {
    expect(shouldSkipRespawnForArgv(["node", "nexa", "--help"])).toBe(true);
    expect(shouldSkipRespawnForArgv(["node", "nexa", "-V"])).toBe(true);
  });

  it("keeps respawn path for normal commands", () => {
    expect(shouldSkipRespawnForArgv(["node", "nexa", "status"])).toBe(false);
  });
});
