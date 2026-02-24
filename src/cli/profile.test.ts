import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "nexa",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "nexa", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "nexa", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "nexa", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "nexa", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nexa", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "nexa", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (dev first)", () => {
    const res = parseCliProfileArgs(["node", "nexa", "--dev", "--profile", "work", "status"]);
    expect(res.ok).toBe(false);
  });

  it("rejects combining --dev with --profile (profile first)", () => {
    const res = parseCliProfileArgs(["node", "nexa", "--profile", "work", "--dev", "status"]);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".nexa-dev");
    expect(env.NEXA_PROFILE).toBe("dev");
    expect(env.NEXA_STATE_DIR).toBe(expectedStateDir);
    expect(env.NEXA_CONFIG_PATH).toBe(path.join(expectedStateDir, "nexa.json"));
    expect(env.NEXA_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      NEXA_STATE_DIR: "/custom",
      NEXA_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.NEXA_STATE_DIR).toBe("/custom");
    expect(env.NEXA_GATEWAY_PORT).toBe("19099");
    expect(env.NEXA_CONFIG_PATH).toBe(path.join("/custom", "nexa.json"));
  });

  it("uses NEXA_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      NEXA_HOME: "/srv/nexa-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/nexa-home");
    expect(env.NEXA_STATE_DIR).toBe(path.join(resolvedHome, ".nexa-work"));
    expect(env.NEXA_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".nexa-work", "nexa.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it("returns command unchanged when no profile is set", () => {
    expect(formatCliCommand("nexa doctor --fix", {})).toBe("nexa doctor --fix");
  });

  it("returns command unchanged when profile is default", () => {
    expect(formatCliCommand("nexa doctor --fix", { NEXA_PROFILE: "default" })).toBe(
      "nexa doctor --fix",
    );
  });

  it("returns command unchanged when profile is Default (case-insensitive)", () => {
    expect(formatCliCommand("nexa doctor --fix", { NEXA_PROFILE: "Default" })).toBe(
      "nexa doctor --fix",
    );
  });

  it("returns command unchanged when profile is invalid", () => {
    expect(formatCliCommand("nexa doctor --fix", { NEXA_PROFILE: "bad profile" })).toBe(
      "nexa doctor --fix",
    );
  });

  it("returns command unchanged when --profile is already present", () => {
    expect(
      formatCliCommand("nexa --profile work doctor --fix", { NEXA_PROFILE: "work" }),
    ).toBe("nexa --profile work doctor --fix");
  });

  it("returns command unchanged when --dev is already present", () => {
    expect(formatCliCommand("nexa --dev doctor", { NEXA_PROFILE: "dev" })).toBe(
      "nexa --dev doctor",
    );
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("nexa doctor --fix", { NEXA_PROFILE: "work" })).toBe(
      "nexa --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("nexa doctor --fix", { NEXA_PROFILE: "  jbnexa  " })).toBe(
      "nexa --profile jbnexa doctor --fix",
    );
  });

  it("handles command with no args after nexa", () => {
    expect(formatCliCommand("nexa", { NEXA_PROFILE: "test" })).toBe(
      "nexa --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm nexa doctor", { NEXA_PROFILE: "work" })).toBe(
      "pnpm nexa --profile work doctor",
    );
  });
});
