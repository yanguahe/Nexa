export function extractErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") {
    return undefined;
  }
  const code = (err as { code?: unknown }).code;
  if (typeof code === "string") {
    return code;
  }
  if (typeof code === "number") {
    return String(code);
  }
  return undefined;
}

/**
 * Type guard for NodeJS.ErrnoException (any error with a `code` property).
 */
export function isErrno(err: unknown): err is NodeJS.ErrnoException {
  return Boolean(err && typeof err === "object" && "code" in err);
}

/**
 * Check if an error has a specific errno code.
 */
export function hasErrnoCode(err: unknown, code: string): boolean {
  return isErrno(err) && err.code === code;
}

export function formatErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message || err.name || "Error";
  }
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") {
    return String(err);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return Object.prototype.toString.call(err);
  }
}

export function formatUncaughtError(err: unknown): string {
  if (extractErrorCode(err) === "INVALID_CONFIG") {
    return formatErrorMessage(err);
  }
  if (err instanceof Error) {
    return err.stack ?? err.message ?? err.name;
  }
  return formatErrorMessage(err);
}

/**
 * Detect errors from channel plugin WebSocket internals that are safe to
 * survive.  The canonical case is the dingtalk-stream SDK firing
 * `WebSocket.ping()` on a socket whose readyState is still CONNECTING
 * (a race between the heartbeat timer and reconnection).  These originate
 * from a `setInterval` callback in plugin code, NOT from core logic,
 * so the process state remains consistent.
 */
export function isRecoverableChannelError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const msg = err.message ?? "";
  const stack = err.stack ?? "";

  // ws library throws this when ping/send is called on a non-OPEN socket
  if (!msg.includes("WebSocket is not open")) return false;

  // Only recover when the throw originates from a plugin/extension, not core.
  // Plugin stacks contain `.nexa/` (installed plugins) or `extensions/`.
  if (/[/\\]\.nexa[/\\]|[/\\]extensions[/\\]/.test(stack)) return true;

  // Also recover when the throw clearly comes from a timer (heartbeat race)
  if (stack.includes("Timeout._onTimeout")) return true;

  return false;
}
