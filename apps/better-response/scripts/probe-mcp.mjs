import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import packageJson from "../package.json" with { type: "json" };

async function rejects(client, schema) {
  try {
    const result = await client.callTool({ name: "visualize", arguments: schema });
    return result.isError === true;
  } catch {
    return true;
  }
}

function childrenAcceptsReactShape(children) {
  const options = children?.anyOf ?? [];
  const hasString = options.some((option) => option?.type === "string");
  const hasNode = options.some((option) => option?.$ref === "#");
  const arrayItems = options.find((option) => option?.type === "array")?.items;
  const itemOptions = arrayItems?.anyOf ?? (arrayItems ? [arrayItems] : []);
  return (
    hasString &&
    hasNode &&
    itemOptions.some((option) => option?.type === "string") &&
    itemOptions.some((option) => option?.$ref === "#")
  );
}

function propValueAcceptsType(schema, type) {
  if (!schema) return false;
  if (schema.type === type) return true;
  if (Array.isArray(schema.type) && schema.type.includes(type)) return true;
  if (schema.$ref) return true;
  const options = schema.anyOf ?? schema.oneOf ?? [];
  return options.some((option) => propValueAcceptsType(option, type));
}

{
  const endpoint = process.argv[2];
  if (!endpoint) {
    throw new Error("Pass the Streamable HTTP endpoint to probe.");
  }
  // A deployment advertises its own production host; a local build falls back
  // to the production widget domain.
  const endpointUrl = new URL(endpoint);
  const widgetDomain =
    endpointUrl.hostname === "127.0.0.1"
      ? "https://betterresponse.vercel.app"
      : endpointUrl.origin;

  const client = new Client({ name: "better-response-probe", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));

  await client.connect(transport);

  try {
    const tools = await client.listTools();
    const tool = tools.tools[0];
    const instructions = client.getInstructions();
    const nodeTypes = tool?.inputSchema?.properties?.type?.enum;
    const schema = {
      type: "Stack",
      props: {
        direction: "vertical",
        gap: "md",
      },
      children: [
        { type: "Text", props: { variant: "heading", text: "Pasta night" } },
        { type: "Text", props: { text: "Shopping list" } },
        {
          type: "Progress",
          props: { value: 1, max: 2, text: "1 of 2 ingredients" },
        },
        {
          type: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            {
              type: "Label",
              props: { text: "400 g spaghetti" },
              children: [{ type: "Checkbox", props: { defaultChecked: false } }],
            },
            {
              type: "Label",
              props: { text: "2 eggs" },
              children: [{ type: "Checkbox", props: { disabled: false } }],
            },
          ],
        },
        {
          type: "Button",
          props: {
            size: "sm",
            text: "Reset",
            type: "button",
            variant: "outline",
          },
        },
      ],
    };
    const result = await client.callTool({ name: "visualize", arguments: schema });
    const comparison = await client.callTool({
      name: "visualize",
      arguments: {
        type: "Stack",
        props: { direction: "vertical", gap: "md", padding: "sm" },
        children: [
          {
            type: "Stack",
            props: { direction: "horizontal", align: "center" },
            children: [
              { type: "Text", props: { variant: "heading", text: "Pick a commute" } },
              { type: "Spacer" },
              { type: "Text", props: { variant: "caption", text: "today" } },
            ],
          },
          {
            type: "Stack",
            props: { direction: "horizontal", gap: "md" },
            children: [
              {
                type: "Stack",
                props: { flex: true, gap: "sm" },
                children: [
                  { type: "Text", props: { variant: "label", text: "Bus" } },
                  { type: "Separator" },
                  {
                    type: "Text",
                    props: { variant: "caption", text: "35 minutes with one transfer" },
                  },
                ],
              },
              {
                type: "Stack",
                props: { flex: true, gap: "sm" },
                children: [
                  { type: "Text", props: { variant: "label", text: "Train" } },
                  { type: "Separator" },
                  {
                    type: "Text",
                    props: { variant: "caption", text: "22 minutes direct" },
                  },
                ],
              },
            ],
          },
          {
            type: "Scroll",
            props: { height: "sm", orientation: "vertical" },
            children: [
              {
                type: "Text",
                props: { variant: "caption", text: "Fares last checked this morning." },
              },
            ],
          },
        ],
      },
    });
    const layoutKit = await client.callTool({
      name: "visualize",
      arguments: {
        type: "Stack",
        props: { gap: "md" },
        children: [
          {
            type: "Wrap",
            props: { gap: "sm" },
            children: [
              { type: "Text", props: { variant: "caption", text: "Bus" } },
              { type: "Text", props: { variant: "caption", text: "Train" } },
              { type: "Text", props: { variant: "caption", text: "Bike" } },
            ],
          },
          {
            type: "Grid",
            props: { columns: 2, gap: "md" },
            children: [
              { type: "Text", props: { text: "Left" } },
              { type: "Text", props: { text: "Right" } },
            ],
          },
        ],
      },
    });
    const tableKit = await client.callTool({
      name: "visualize",
      arguments: {
        type: "DataGrid",
        props: {
          columns: [
            { key: "Option", label: "Option" },
            { key: "Time", label: "Time" },
            {
              key: "Cost",
              label: "Cost",
              type: "number",
              format: { style: "currency", currency: "EUR" },
            },
            { key: "Departs", label: "Departs", type: "date" },
            { key: "Direct", label: "Direct", type: "boolean" },
          ],
          data: [
            {
              Option: "Train",
              Time: "2h 10m",
              Cost: 38,
              Departs: "2026-09-12T07:30:00Z",
              Direct: true,
            },
            {
              Option: "Bus",
              Time: "3h",
              Cost: 18,
              Departs: "2026-09-12T09:15:00Z",
              Direct: false,
            },
          ],
        },
      },
    });
    const slottedGrid = await client.callTool({
      name: "visualize",
      arguments: {
        type: "DataGrid",
        props: {
          columns: [{ key: "name", label: "Name" }, { key: "performance" }],
          data: [
            {
              name: "Kiril",
              performance: {
                children: { type: "Rating", props: { value: 3.5 } },
                value: 3,
              },
            },
          ],
        },
      },
    });
    const rejectsUnsafeEmbeddedNode = await rejects(client, {
      type: "DataGrid",
      props: {
        data: [
          {
            cell: {
              children: {
                type: "Text",
                props: { text: "Unsafe", onClick: "alert(1)" },
              },
            },
          },
        ],
      },
    });
    const rejectsEmbeddedDangerousHtml = await rejects(client, {
      type: "DataGrid",
      props: {
        data: [
          {
            cell: {
              children: {
                type: "Text",
                props: { dangerouslySetInnerHTML: { __html: "<img src=x>" } },
              },
            },
          },
        ],
      },
    });
    const acceptsNodeLikeData = !(await rejects(client, {
      type: "DataGrid",
      props: {
        data: [
          { cell: { type: "Sparkline", props: { value: 3 } } },
          { cell: { type: "Text", note: "extra keys make this plain data" } },
        ],
      },
    }));
    const acceptsDataTypeKey = !(await rejects(client, {
      type: "DataGrid",
      props: {
        columns: ["label", "type"],
        data: [{ label: "Dinner", type: "expense", amount: 12 }],
      },
    }));
    const alternateRoot = await client.callTool({
      name: "visualize",
      arguments: {
        type: "Text",
        props: { variant: "body", text: "A tree can start with any registered component." },
      },
    });
    const acceptsSiblingChildren = !(await rejects(client, {
      type: "Stack",
      children: [{ type: "Text", props: { text: "Children sit beside type." } }],
    }));
    const acceptsStringChildren = !(await rejects(client, {
      type: "Text",
      children: "Hello",
    }));
    const acceptsStringArrayChildren = !(await rejects(client, {
      type: "Stack",
      children: ["Hello"],
    }));
    const acceptsCheckboxChildren = !(await rejects(client, {
      type: "Checkbox",
      children: "Checkbox has no children.",
    }));
    const rejectsPropsChildren = await rejects(client, {
      type: "Stack",
      props: { children: ["Hello from props."] },
    });
    const acceptsNumericGap = !(await rejects(client, {
      type: "Stack",
      props: { gap: 8 },
      children: [{ type: "Text", children: "Hi" }],
    }));
    const acceptsSubheading = !(await rejects(client, {
      type: "Text",
      props: { variant: "subheading", text: "Section" },
    }));
    const acceptsUnknownGap = !(await rejects(client, {
      type: "Stack",
      props: { gap: "xs" },
      children: [{ type: "Text", children: "Hi" }],
    }));
    const rejectsUnknownType = await rejects(client, {
      type: "div",
      children: ["Native HTML is not a public node."],
    });
    const slottedCard = await client.callTool({
      name: "visualize",
      arguments: {
        type: "Card",
        props: {
          title: "Harbor House",
          description: ["2 nights · ", { type: "Rating", props: { value: 4.5 } }],
          action: { type: "Text", props: { variant: "caption", text: "€240" } },
          footer: [
            { type: "Button", props: { text: "Details", variant: "outline" } },
          ],
        },
        children: [{ type: "Text", props: { text: "Sea view, breakfast included." } }],
      },
    });
    const rejectsUnsafeSlotNode = await rejects(client, {
      type: "Card",
      props: {
        title: { type: "Text", props: { text: "Unsafe", onClick: "alert(1)" } },
      },
    });
    const rejectsBadge = await rejects(client, {
      type: "Badge",
      children: ["Badge belongs in common ui, not the agent SDK."],
    });
    const componentChildren = await client.callTool({
      name: "visualize",
      arguments: {
        type: "Progress",
        props: { value: 1, max: 2, text: "Halfway" },
      },
    });
    const acceptsUnknownComponentProp = !(await rejects(client, {
      type: "Progress",
      props: { label: "Not a registered prop" },
    }));
    const rejectsEventHandler = await rejects(client, {
      type: "Button",
      props: { onClick: "alert(1)", text: "Unsafe" },
    });
    const rejectsNativeHtml = await rejects(client, {
      type: "article",
      children: ["HTML elements are not in the schema."],
    });
    const rejectsStyle = await rejects(client, {
      type: "Stack",
      props: { style: { color: "red" } },
      children: [{ type: "Text", props: { text: "No free-form style." } }],
    });
    const rejectsClassName = await rejects(client, {
      type: "Stack",
      props: { className: "text-red-500" },
      children: [{ type: "Text", props: { text: "No className." } }],
    });
    const rejectsKey = await rejects(client, {
      type: "Text",
      props: { key: "agent-key", text: "No React key prop." },
    });
    const rejectsUnsafeUrl = await rejects(client, {
      type: "Text",
      props: { src: "javascript:alert(1)", text: "Unsafe" },
    });
    const rejectsImage = await rejects(client, {
      type: "Image",
      props: { src: "https://example.com/map.png", alt: "Map preview" },
    });
    const rejectsBox = await rejects(client, {
      type: "Box",
      children: ["Box is not an agent layout primitive."],
    });
    const rejectsFlex = await rejects(client, {
      type: "Flex",
      children: ["Flex is compressed into Stack."],
    });
    const rejectsCenter = await rejects(client, {
      type: "Center",
      children: ["Center is a Stack alignment recipe."],
    });
    const acceptsUnknownVariant = !(await rejects(client, {
      type: "Text",
      props: { variant: "title", text: "Unknown text variants are not accepted." },
    }));
    const acceptsUnknownColumns = !(await rejects(client, {
      type: "Grid",
      props: { columns: 5 },
      children: [
        { type: "Text", props: { text: "Left" } },
        { type: "Text", props: { text: "Right" } },
      ],
    }));
    const acceptsObjectProp = !(await rejects(client, {
      type: "Text",
      props: { data: { nested: true } },
    }));
    const acceptsArrayProp = !(await rejects(client, {
      type: "Text",
      props: { data: ["nested"] },
    }));
    const resourceUri = result._meta?.ui?.resourceUri;
    const resource = await client.readResource({ uri: resourceUri });
    const resourceContent = resource.contents[0];
    const html = resourceContent?.text;
    const heading = result.structuredContent?.schema?.children?.[0]?.props?.text;
    const comparisonHeading =
      comparison.structuredContent?.schema?.children?.[0]?.children?.[0]?.props?.text;
    const expectedTypes = [
      "Button",
      "Card",
      "Checkbox",
      "DataGrid",
      "Grid",
      "Label",
      "Progress",
      "Rating",
      "Scroll",
      "Separator",
      "Spacer",
      "Stack",
      "Text",
      "Wrap",
    ];
    const comparisonChildren = comparison.structuredContent?.schema?.children;
    const layoutChildren = layoutKit.structuredContent?.schema?.children;
    const dataGrid = tableKit.structuredContent?.schema;
    const checks = {
      oneTool: tools.tools.length === 1,
      toolName: tool?.name === "visualize",
      toolAnnotations:
        tool?.annotations?.readOnlyHint === true &&
        tool.annotations.destructiveHint === false &&
        tool.annotations.idempotentHint === true &&
        tool.annotations.openWorldHint === false,
      toolOutputTemplate:
        tool?._meta?.["openai/outputTemplate"] === "ui://visualize/app.html",
      toolOutputSchema:
        tool?.outputSchema?.type === "object" &&
        tool.outputSchema.properties?.schema?.type === "object",
      serverInstructions:
        typeof instructions === "string" &&
        instructions.length > 0 &&
        instructions.length <= 512,
      serverVersion: client.getServerVersion()?.version === packageJson.version,
      widgetDomain: resourceContent?._meta?.ui?.domain === widgetDomain,
      // Hosts disagree on whether ui metadata sits on the content item or the
      // response, so both must carry it.
      widgetDomainOnResponse: resource?._meta?.ui?.domain === widgetDomain,
      widgetCsp:
        Array.isArray(resourceContent?._meta?.ui?.csp?.connectDomains) &&
        resourceContent._meta.ui.csp.connectDomains.length === 0 &&
        Array.isArray(resourceContent._meta.ui.csp.resourceDomains) &&
        resourceContent._meta.ui.csp.resourceDomains.length === 0 &&
        resourceContent._meta.ui.csp.frameDomains === undefined,
      topLevelComponentContract:
        tool?.description?.includes("Registered component contract:\n") === true &&
        tool.description.includes("Text — Displays readable text.\n") &&
        tool.description.includes(
          'props.variant?: "body" | "heading" | "label" | "caption" | "subheading" — Presentation role for the text. subheading is caption; label is typography only and forms no association with a control.\n',
        ) &&
        tool.description.includes(
          "children?: string | Node | Array<string | Node> — Nested nodes or a visible string.",
        ) &&
        tool.description.includes(
          "DataGrid — Tabular data from row objects. Typed columns are formatted and aligned; untyped columns render as text.\n",
        ) &&
        tool.description.includes(
          "props.title?: string | Node | Array<string | Node> — Header heading in emphasized text.\n",
        ) &&
        tool.description.includes(
          "props.media?: string | Node | Array<string | Node> — Rendered first, spanning the card's full width with no inner padding.\n",
        ) &&
        tool.description.includes("props.data?: array") &&
        tool.description.includes("props.columns?: array") &&
        tool.description.includes(
          'Intl.NumberFormat options for number, such as\n{ "style": "currency", "currency": "EUR" }',
        ),
      nodeTypes: Array.isArray(nodeTypes),
      noArticleType: !nodeTypes?.includes("article"),
      noDivType: !nodeTypes?.includes("div"),
      noBadgeType: !nodeTypes?.includes("Badge"),
      noImageType: !nodeTypes?.includes("Image"),
      expectedSdkTypes: expectedTypes.every(
        (type) => nodeTypes?.filter((value) => value === type).length === 1,
      ),
      alternateRoot: alternateRoot.structuredContent?.schema?.type === "Text",
      heading: heading === "Pasta night",
      comparisonHeading: comparisonHeading === "Pick a commute",
      comparisonUsesSpacer: comparisonChildren?.[0]?.children?.[1]?.type === "Spacer",
      comparisonUsesFlex:
        comparisonChildren?.[1]?.children?.[0]?.props?.flex === true,
      comparisonUsesScroll: comparisonChildren?.[2]?.type === "Scroll",
      layoutUsesWrap: layoutChildren?.[0]?.type === "Wrap",
      layoutUsesGrid: layoutChildren?.[1]?.type === "Grid",
      layoutGridColumns: layoutChildren?.[1]?.props?.columns === 2,
      dataGridType: dataGrid?.type === "DataGrid",
      dataGridColumns: Array.isArray(dataGrid?.props?.columns) &&
        dataGrid.props.columns.length === 5,
      dataGridRows: Array.isArray(dataGrid?.props?.data) &&
        dataGrid.props.data.length === 2,
      dataGridSlottedCell:
        slottedGrid.structuredContent?.schema?.props?.data?.[0]?.performance
          ?.children?.type === "Rating" &&
        slottedGrid.structuredContent.schema.props.data[0].performance.value ===
          3,
      cardSlots:
        slottedCard.structuredContent?.schema?.props?.description?.[1]?.type ===
          "Rating" &&
        slottedCard.structuredContent.schema.props.action?.type === "Text" &&
        slottedCard.structuredContent.schema.props.footer?.[0]?.type === "Button",
      rejectsUnsafeSlotNode,
      rejectsUnsafeEmbeddedNode,
      rejectsEmbeddedDangerousHtml,
      acceptsNodeLikeData,
      acceptsDataTypeKey,
      dataGridTypedColumns:
        dataGrid?.props?.columns?.[2]?.type === "number" &&
        dataGrid.props.columns[2].format?.currency === "EUR" &&
        dataGrid.props.columns[3].type === "date" &&
        dataGrid.props.columns[4].type === "boolean",
      oneGenericNodeSchema:
        tool?.inputSchema?.type === "object" &&
        tool.inputSchema.anyOf === undefined,
      genericJsonProps:
        tool?.inputSchema?.properties?.props?.type === "object" &&
        ["boolean", "number", "string", "null", "array", "object"].every((type) =>
          propValueAcceptsType(
            tool.inputSchema.properties.props.additionalProperties,
            type,
          ),
        ),
      genericReactChildren: childrenAcceptsReactShape(
        tool?.inputSchema?.properties?.children,
      ),
      compactSchema:
        Buffer.byteLength(JSON.stringify(tool?.inputSchema)) < 2000,
      componentChildren:
        componentChildren.structuredContent?.schema?.props?.text === "Halfway",
      rootTypeEnum:
        Array.isArray(tool?.inputSchema?.properties?.type?.enum) &&
        expectedTypes.every((type) =>
          tool.inputSchema.properties.type.enum.includes(type),
        ),
      acceptsSiblingChildren,
      acceptsStringChildren,
      acceptsStringArrayChildren,
      acceptsCheckboxChildren,
      rejectsPropsChildren,
      acceptsNumericGap,
      acceptsSubheading,
      acceptsUnknownGap,
      rejectsUnknownType,
      rejectsBadge,
      acceptsUnknownComponentProp,
      rejectsEventHandler,
      rejectsNativeHtml,
      rejectsStyle,
      rejectsClassName,
      rejectsKey,
      rejectsUnsafeUrl,
      rejectsImage,
      rejectsBox,
      rejectsFlex,
      rejectsCenter,
      acceptsUnknownVariant,
      acceptsUnknownColumns,
      acceptsObjectProp,
      acceptsArrayProp,
      contentStaysOpaque:
        result.content?.[0]?.text === "Improved this response with a view.",
      bundledApp: typeof html === "string" && html.includes("<title>Visualize</title>"),
      bundledInspectHidden:
        typeof html === "string" && !html.includes("Inspect tree"),
      bundledStackLayoutCss:
        typeof html === "string" &&
        (html.includes(".Stack{display:flex") || html.includes(".Stack{display: flex")),
      bundledProgress:
        typeof html === "string" &&
        html.includes("progress-track") &&
        html.includes("progress-indicator"),
      bundledButton: typeof html === "string" && html.includes("data-slot") && html.includes("button"),
      bundledCheckbox:
        typeof html === "string" && html.includes("checkbox-indicator"),
      bundledLabel: typeof html === "string" && html.includes('data-slot":"label"'),
      bundledStack: typeof html === "string" && html.includes('data-slot":"stack"'),
      bundledText: typeof html === "string" && html.includes('data-slot":"text"'),
      bundledSeparator: typeof html === "string" && html.includes('data-slot":"separator"'),
      bundledSpacer: typeof html === "string" && html.includes('data-slot":"spacer"'),
      bundledScroll: typeof html === "string" && html.includes('data-slot":"scroll"'),
      bundledWrap: typeof html === "string" && html.includes('data-slot":"wrap"'),
      bundledGrid: typeof html === "string" && html.includes('data-slot":"grid"'),
      bundledTable: typeof html === "string" && html.includes('data-slot":"table"'),
      bundledRating: typeof html === "string" && html.includes('data-slot":"rating"'),
      bundledCard:
        typeof html === "string" &&
        html.includes('data-slot":"card"') &&
        html.includes('data-slot":"card-media"'),
      bundledTheme:
        typeof html === "string" &&
        html.includes("--color-background-primary") &&
        html.includes("[data-theme=dark]"),
      // The declared CSP allows no external origin, so nothing in the bundle
      // may fetch one. Namespaces and error-message links are not fetches.
      bundledNoExternalAssetOrigin:
        typeof html === "string" &&
        !/(?:url\(\s*['"]?|src\s*[=:]\s*['"]|href\s*[=:]\s*['"]|@import\s+['"])https?:\/\//i.test(
          html,
        ),
      prefersBorder: resourceContent?._meta?.ui?.prefersBorder === true,
    };
    const failedChecks = Object.entries(checks)
      .filter(([, passed]) => passed !== true)
      .map(([name]) => name);

    if (failedChecks.length > 0) {
      throw new Error(`Better Response vertical probe failed: ${failedChecks.join(", ")}`);
    }

    console.log(
      JSON.stringify(
        {
          runtime: "better-response",
          transport: "streamable-http",
          tools: tools.tools.map((tool) => tool.name),
          resourceUri,
          schemaBytes: Buffer.byteLength(JSON.stringify(tool.inputSchema)),
          descriptionBytes: Buffer.byteLength(tool.description ?? ""),
          nodeTypes,
          echoedHeading: heading,
          comparisonHeading,
          bundledAppBytes: html.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await client.close();
  }
}
