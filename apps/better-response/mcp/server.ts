import {
  advertiseTreeJsonSchema,
  createTree,
  type Tree,
} from "@better-response/engawa";
import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
  RESOURCE_URI_META_KEY,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import componentMetadata from "./components/index.ts?meta";
import { version } from "../package.json";

const RESOURCE_URI = "ui://visualize/app.html";

// ChatGPT derives the widget's sandbox origin from this and requires it to be
// unique per plugin. It identifies the app; it is not a fetch target.
const WIDGET_DOMAIN = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "betterresponse.vercel.app"}`;

// The built app inlines every asset, so it needs no external origin at all.
// resourceDomains covers script-src and style-src as well as img-src, so an
// empty policy is both the honest one and the narrowest one.
const RESOURCE_META = {
  ui: {
    csp: { connectDomains: [], resourceDomains: [] },
    domain: WIDGET_DOMAIN,
    prefersBorder: true,
  },
};
const tree = createTree(componentMetadata);
const componentContract = Object.entries(componentMetadata)
  .map(([name, component]) => {
    const props = Object.entries(component.props).map(([propName, metadata]) => {
      const kinds = Array.isArray(metadata.type)
        ? metadata.type
        : [metadata.type];
      const enumeratedKinds = new Set(
        metadata.enum?.map((value) => typeof value),
      );
      const values = [
        ...(metadata.enum?.map((value) => JSON.stringify(value)) ?? []),
        ...kinds
          .filter((kind) => !enumeratedKinds.has(kind as never))
          .map((kind) =>
            kind === "node" ? "string | Node | Array<string | Node>" : kind,
          ),
        ...(metadata.nullable ? ["null"] : []),
      ];

      return `  props.${propName}${metadata.optional ? "?" : ""}: ${values.join(" | ")}${metadata.description ? ` — ${metadata.description}` : ""}`;
    });
    const children = component.children
      ? `  children?: string | Node | Array<string | Node>${component.children.description ? ` — ${component.children.description}` : ""}`
      : undefined;

    return [
      `${name}${component.description ? ` — ${component.description}` : ""}`,
      ...props,
      ...(children ? [children] : []),
    ].join("\n");
  })
  .join("\n");
advertiseTreeAsToolObject(tree);

export function createBetterResponseServer(
  readAppHtml: () => Promise<string>,
): McpServer {
  const server = new McpServer(
    { name: "Visualize", version },
    {
      instructions:
        "Visualize renders the current reply as an interface instead of Markdown. Author its tree from what the conversation already established: preserve those facts, invent none, and choose the smallest shape that makes the answer easier to use. Everything it renders is local to the view — nothing the user touches there reaches you — so never use it to collect an answer you need back. Do not restate the view as Markdown beside it.",
    },
  );

  server.registerTool(
    "visualize",
    {
      title: "Visualize this",
      description:
        "Improve the agent's response with a usable view when plain text is harder to work with. Use proactively whenever the available UI schema can produce a response that is materially easier to use than static prose or Markdown, regardless of topic or output shape. Also use when the user explicitly asks to visualize or for interface output. Do not use when a view adds no practical value or input must return to the agent. Pass an exact Engawa tree as the tool arguments: type, optional props, and optional children beside type. Never wrap the tree in another object, never pass natural-language intent, never pass style or className, and use only the registered components exposed below.\n\nRegistered component contract:\n" +
        componentContract,
      inputSchema: tree,
      // The result echoes the authored tree for the app to render. Describing
      // it structurally would repeat the whole node contract the model just
      // read on the input.
      outputSchema: {
        schema: z
          .object({})
          .passthrough()
          .describe("The Engawa tree that was rendered, echoed from the tool input."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        ui: { resourceUri: RESOURCE_URI },
        [RESOURCE_URI_META_KEY]: RESOURCE_URI,
        "openai/outputTemplate": RESOURCE_URI,
      },
    },
    async (schema: Tree) => {
      return {
        content: [
          {
            type: "text",
            text: "Improved this response with a view.",
          },
        ],
        structuredContent: { schema },
        _meta: { ui: { resourceUri: RESOURCE_URI } },
      };
    },
  );

  markListedToolInputsAsObjects(server);

  registerAppResource(
    server,
    "visualize-app",
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      // The spec's example nests _meta in the content item, but VS Code-derived
      // hosts read it off the response. Both carry it until that settles.
      // https://github.com/modelcontextprotocol/ext-apps/issues/242
      _meta: RESOURCE_META,
      contents: [
        {
          uri: RESOURCE_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readAppHtml(),
          _meta: RESOURCE_META,
        },
      ],
    }),
  );

  return server;
}

function advertiseTreeAsToolObject(schema: typeof tree) {
  const advertised = schema as typeof tree & { shape?: unknown };

  if (advertised.shape === undefined) {
    Object.defineProperty(advertised, "shape", {
      configurable: true,
      enumerable: false,
      get() {
        return {};
      },
    });
  }
}

function markListedToolInputsAsObjects(server: McpServer) {
  const handlers = (
    server.server as unknown as {
      _requestHandlers: Map<
        string,
        (
          request: unknown,
          extra: unknown,
        ) => Promise<{ tools?: Array<{ inputSchema?: Record<string, unknown> }> }>
      >;
    }
  )._requestHandlers;
  const existing = handlers.get("tools/list");

  if (!existing) {
    throw new Error("Expected tools/list to be registered.");
  }

  handlers.set("tools/list", async (request, extra) => {
    const result = await existing(request, extra);

    for (const tool of result.tools ?? []) {
      const schema = tool.inputSchema;
      if (!schema) continue;

      tool.inputSchema = advertiseTreeJsonSchema(
        schema.type === undefined ? { type: "object", ...schema } : schema,
      );
    }

    return result;
  });
}
