import { describe, expect, test } from "vitest";
import {
  getFrontmatterString,
  normalizeStringList,
  parseFrontmatterBool,
  resolveNexaManifestBlock,
} from "./frontmatter.js";

describe("shared/frontmatter", () => {
  test("normalizeStringList handles strings and arrays", () => {
    expect(normalizeStringList("a, b,,c")).toEqual(["a", "b", "c"]);
    expect(normalizeStringList([" a ", "", "b"])).toEqual(["a", "b"]);
    expect(normalizeStringList(null)).toEqual([]);
  });

  test("getFrontmatterString extracts strings only", () => {
    expect(getFrontmatterString({ a: "b" }, "a")).toBe("b");
    expect(getFrontmatterString({ a: 1 }, "a")).toBeUndefined();
  });

  test("parseFrontmatterBool respects fallback", () => {
    expect(parseFrontmatterBool("true", false)).toBe(true);
    expect(parseFrontmatterBool("false", true)).toBe(false);
    expect(parseFrontmatterBool(undefined, true)).toBe(true);
  });

  test("resolveNexaManifestBlock parses JSON5 metadata and picks nexa block", () => {
    const frontmatter = {
      metadata: "{ nexa: { foo: 1, bar: 'baz' } }",
    };
    expect(resolveNexaManifestBlock({ frontmatter })).toEqual({ foo: 1, bar: "baz" });
  });

  test("resolveNexaManifestBlock returns undefined for invalid input", () => {
    expect(resolveNexaManifestBlock({ frontmatter: {} })).toBeUndefined();
    expect(
      resolveNexaManifestBlock({ frontmatter: { metadata: "not-json5" } }),
    ).toBeUndefined();
    expect(
      resolveNexaManifestBlock({ frontmatter: { metadata: "{ nope: { a: 1 } }" } }),
    ).toBeUndefined();
  });
});
