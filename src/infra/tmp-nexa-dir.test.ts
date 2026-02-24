import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { POSIX_NEXA_TMP_DIR, resolvePreferredNexaTmpDir } from "./tmp-nexa-dir.js";

describe("resolvePreferredNexaTmpDir", () => {
  it("prefers /tmp/nexa when it already exists and is writable", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => ({
      isDirectory: () => true,
      isSymbolicLink: () => false,
      uid: 501,
      mode: 0o40700,
    }));
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(lstatSync).toHaveBeenCalledTimes(1);
    expect(accessSync).toHaveBeenCalledTimes(1);
    expect(resolved).toBe(POSIX_NEXA_TMP_DIR);
    expect(tmpdir).not.toHaveBeenCalled();
  });

  it("prefers /tmp/nexa when it does not exist but /tmp is writable", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => {
      const err = new Error("missing") as Error & { code?: string };
      err.code = "ENOENT";
      throw err;
    });
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    // second lstat call (after mkdir) should succeed
    lstatSync.mockImplementationOnce(() => {
      const err = new Error("missing") as Error & { code?: string };
      err.code = "ENOENT";
      throw err;
    });
    lstatSync.mockImplementationOnce(() => ({
      isDirectory: () => true,
      isSymbolicLink: () => false,
      uid: 501,
      mode: 0o40700,
    }));

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(POSIX_NEXA_TMP_DIR);
    expect(accessSync).toHaveBeenCalledWith("/tmp", expect.any(Number));
    expect(mkdirSync).toHaveBeenCalledWith(POSIX_NEXA_TMP_DIR, expect.any(Object));
    expect(tmpdir).not.toHaveBeenCalled();
  });

  it("falls back to os.tmpdir()/nexa when /tmp/nexa is not a directory", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => ({
      isDirectory: () => false,
      isSymbolicLink: () => false,
      uid: 501,
      mode: 0o100644,
    }));
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(path.join("/var/fallback", "nexa-501"));
    expect(tmpdir).toHaveBeenCalledTimes(1);
  });

  it("falls back to os.tmpdir()/nexa when /tmp is not writable", () => {
    const accessSync = vi.fn((target: string) => {
      if (target === "/tmp") {
        throw new Error("read-only");
      }
    });
    const lstatSync = vi.fn(() => {
      const err = new Error("missing") as Error & { code?: string };
      err.code = "ENOENT";
      throw err;
    });
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(path.join("/var/fallback", "nexa-501"));
    expect(tmpdir).toHaveBeenCalledTimes(1);
  });

  it("falls back when /tmp/nexa is a symlink", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => ({
      isDirectory: () => true,
      isSymbolicLink: () => true,
      uid: 501,
      mode: 0o120777,
    }));
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(path.join("/var/fallback", "nexa-501"));
    expect(tmpdir).toHaveBeenCalledTimes(1);
  });

  it("falls back when /tmp/nexa is not owned by the current user", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => ({
      isDirectory: () => true,
      isSymbolicLink: () => false,
      uid: 0,
      mode: 0o40700,
    }));
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(path.join("/var/fallback", "nexa-501"));
    expect(tmpdir).toHaveBeenCalledTimes(1);
  });

  it("falls back when /tmp/nexa is group/other writable", () => {
    const accessSync = vi.fn();
    const lstatSync = vi.fn(() => ({
      isDirectory: () => true,
      isSymbolicLink: () => false,
      uid: 501,
      mode: 0o40777,
    }));
    const mkdirSync = vi.fn();
    const getuid = vi.fn(() => 501);
    const tmpdir = vi.fn(() => "/var/fallback");

    const resolved = resolvePreferredNexaTmpDir({
      accessSync,
      lstatSync,
      mkdirSync,
      getuid,
      tmpdir,
    });

    expect(resolved).toBe(path.join("/var/fallback", "nexa-501"));
    expect(tmpdir).toHaveBeenCalledTimes(1);
  });
});
