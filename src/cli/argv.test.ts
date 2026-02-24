import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "nexa", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "nexa", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "nexa", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "nexa", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "nexa", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "nexa", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "nexa", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "nexa"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "nexa", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "nexa", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "nexa", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "nexa", "status", "--timeout=2500"], "--timeout")).toBe(
      "2500",
    );
    expect(getFlagValue(["node", "nexa", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "nexa", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "nexa", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "nexa", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "nexa", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "nexa", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "nexa", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "nexa", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "nexa", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "nexa", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node", "nexa", "status"],
    });
    expect(nodeArgv).toEqual(["node", "nexa", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node-22", "nexa", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "nexa", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node-22.2.0.exe", "nexa", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "nexa", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node-22.2", "nexa", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "nexa", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node-22.2.exe", "nexa", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "nexa", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["/usr/bin/node-22.2.0", "nexa", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "nexa", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["nodejs", "nexa", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "nexa", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["node-dev", "nexa", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "nexa", "node-dev", "nexa", "status"]);

    const directArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["nexa", "status"],
    });
    expect(directArgv).toEqual(["node", "nexa", "status"]);

    const bunArgv = buildParseArgv({
      programName: "nexa",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "nexa",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "nexa", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "nexa", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "config", "get", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "config", "unset", "update"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "models", "list"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "models", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "nexa", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "nexa", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["config", "get"])).toBe(false);
    expect(shouldMigrateStateFromPath(["models", "status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
