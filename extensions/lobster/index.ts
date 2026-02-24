import type {
  AnyAgentTool,
  NexaPluginApi,
  NexaPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: NexaPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as NexaPluginToolFactory,
    { optional: true },
  );
}
