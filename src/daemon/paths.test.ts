import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".nexa"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", NEXA_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".nexa-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", NEXA_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".nexa"));
  });

  it("uses NEXA_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", NEXA_STATE_DIR: "/var/lib/nexa" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/nexa"));
  });

  it("expands ~ in NEXA_STATE_DIR", () => {
    const env = { HOME: "/Users/test", NEXA_STATE_DIR: "~/nexa-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/nexa-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { NEXA_STATE_DIR: "C:\\State\\nexa" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\nexa");
  });
});
