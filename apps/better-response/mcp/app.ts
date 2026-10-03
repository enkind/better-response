import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
} from "@modelcontextprotocol/ext-apps";
import { render, type Tree } from "@better-response/engawa";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "@better-response/common/styles.css";
import "@better-response/engawa/styles.css";
import * as components from "./components/index.ts";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing app root");
}

const app = new App({ name: "Visualize", version: "1.0.1-dev.1" });
const reactRoot = createRoot(root);

app.ontoolresult = (result) => {
  const tree = (result.structuredContent as
    | { schema?: Tree<typeof components> }
    | undefined)?.schema;

  if (!tree) {
    reactRoot.render("The tool result did not include an Engawa payload.");
    return;
  }

  reactRoot.render(
    createElement("div", { className: "engawa-root" }, render(tree, components)),
  );
};

app.onhostcontextchanged = applyHostContext;
app.connect().then(applyHostContext);

function applyHostContext(): void {
  const context = app.getHostContext();

  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
  if (context?.styles?.css?.fonts) applyHostFonts(context.styles.css.fonts);
}
