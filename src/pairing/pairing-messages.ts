import type { PairingChannel } from "./pairing-store.js";
import { formatCliCommand } from "../cli/command-format.js";

export function buildPairingReply(params: {
  channel: PairingChannel;
  idLine: string;
  code: string;
}): string {
  const { channel, idLine, code } = params;
  return [
    "Nexa: access not configured.",
    "",
    idLine,
    "",
    `Pairing code: ${code}`,
    "",
    "Ask the bot owner to approve with:",
    formatCliCommand(`nexa pairing approve ${channel} ${code}`),
  ].join("\n");
}
