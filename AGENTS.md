This is a Proof-of-concept for an SDK which wants to bridge the app between you and an Agent.

It bets thats MCP Apps would become a "standard" that every common agent follows

It is opinionated that UI should by dynamically generated, but with a twist; Instead of our app receiving the intent and we invoke another LLm/Agent to generate UI based on it, instead we expose our UI schema as input, and we simply render it with our own components. This lets the consumer's Agent contract to be the UI schema, and not the intent - this allows us to NOT pay the cost of the LLM call, and allow the user's agent to utilize it's context to generate the most appropriate UI.

## Product context

The product contract is kept outside this repository as an untracked local `PRODUCT.md`. Before product, architecture, planning, or implementation work, read it and treat it as the current source of truth. When it is absent, say so and work from the code rather than inventing product facts.

When the user corrects a product assumption, term, scope boundary, acceptance criterion, or deferred item, update that file in the same task. Also update it when verified research or implementation evidence invalidates a recorded claim. Do not duplicate product facts here.

## Implementation guardrail

Keep the code minimal, direct, and straightforward.

- Implement only the path required by the current acceptance test.
- Do not add speculative features, abstractions, extensibility, fallbacks, or general-purpose infrastructure.
- Do not introduce extra helpers, function definitions, files, or dependencies unless the current path genuinely requires them.
- Prefer simple inline code when logic is used once and remains readable.
- Treat additional components, styling, themes, integrations, and interaction modes as deferred horizontal expansion.
- Every addition must justify itself against the current proof-of-concept.

## Agent-facing component documentation

Every registered component's TSDoc is concatenated into the `visualize` tool description, so it is agent instruction rather than internal documentation. We give the tooling; the agent decides the output.

Describe the mechanism and let the agent derive the consequence. State what the component renders, what each prop accepts, how it behaves, and how it physically connects to another component. Never name a content shape, model the user's data, or prescribe an arrangement.

The check before writing a sentence: could you write it without knowing anything about the conversation the agent is in? If it names a content shape — a before/after comparison, a graded judgment, a toolbar, a title above body — or gives an imperative about what to author, it is a recipe and must not ship.

- Mechanism: "A column's type and format apply to one value per cell."
- Recipe: "Give a before/after comparison two typed columns."

A component also describes only itself. Needing to name another component to explain a use, as opposed to a wiring contract such as `Label`/`Checkbox` association, means the guidance belongs to neither.

When a real-host run does not produce the interface you imagined, the admissible responses are to fix the mechanism, improve the development fixture, or accept the agent's judgment. Writing the recipe into component TSDoc, the skill, or the tool description is not one of them; it silently violates the output-shape neutrality the product contract requires.

## OpenAI client library stories

Treat Storybook coverage as part of the public component change, not as follow-up documentation.

- When adding a consumable interface to `packages/openai`, add its story in `apps/openai-storybook` in the same change.
- When adding or changing an explicit public component prop, color, variant, size, or visual state, expose it through Storybook controls or a focused example in the same change.
- Stories must consume `@better-response/openai` through its public package exports. Do not import package source files by relative path.
- Keep preview-only layout and theme adapters inside `apps/openai-storybook`; do not make Storybook conditions part of the library contract.
- Before considering the change complete, run `pnpm typecheck` and `pnpm build:storybook`.

When adding or changing an interface under `packages/openai/view`, `packages/openai/ui`, or `packages/openai/components`, use the project-local `create-openai-components` skill. It owns the complete vertical authoring workflow across all three React layers.

## Plugin package versioning

Versions are computed by semantic-release from Conventional Commits. Never edit a version by hand; CI writes it into every package, both manifests, and the MCP App, and commits it back.

Every commit subject follows Conventional Commits, and CI rejects any that does not. The type decides the next release:

- `fix:` is a patch: a fix, a packaging change, or any other change to installed contents that preserves the public contract. Use it for such changes even when they are refactors, because a release is what gives hosts a new version to refresh their cached plugin.
- `feat:` is a minor: a backward-compatible addition to the public contract, such as a new component, prop, or accepted value.
- `feat!:` or `fix!:`, or a `BREAKING CHANGE:` footer, is a major: an incompatible contract change, such as removing or renaming a component, prop, or accepted value.
- `docs:`, `ci:`, `chore:`, `test:`, and `refactor:` release nothing; use them only for changes that leave installed contents untouched.

The ChatGPT submission carries the same version as the repository. Run `pnpm probe`; the MCP App HTML is an ignored `apps/better-response` build artifact and must not be committed.

## Environments and releases

Work lands on `main`. Every push to `main` deploys to `https://betterresponse-dev.vercel.app/api/mcp` and, when its commits warrant a release, publishes a `vX.Y.Z-dev.N` GitHub prerelease. `main`'s plugin manifests point at the dev server under the name "Better Response (Dev)" with `better-response-dev.svg` as the logo.

Production at `https://betterresponse.vercel.app/api/mcp` is the ChatGPT submission's server. It changes only through the manual Release run of the CI/CD workflow on `main` (`gh workflow run ci.yml --ref main`), which computes the stable version, deploys and probes production before publishing anything, then publishes the GitHub release and the `production` branch: `main`'s tree with the plugin manifests rewritten to the production URL, name, and logo, and the dev logo removed. Each release attaches `better-response-<version>.zip`, the exact archive to upload when the skill, manifest text, or icon changed. Never commit to `production`, never create version tags by hand, never run `vercel --prod` locally, and never release while a submission is in review if the release changes tools, schemas, instructions, or the widget.

## Local Codex CLI

For local plugin management on this Mac, use the signed CLI bundled with the app at `/Applications/ChatGPT.app/Contents/Resources/codex`. Do not invoke `/usr/local/bin/codex`; macOS blocks that standalone installation and displays a malware warning.

## Commit ownership

The agent owns committing completed work. After each coherent user-requested task that changes the repository:

- Run the required validation and review the final diff.
- Stage only the files and hunks created for that task, preserving unrelated or pre-existing work.
- Create a clear, scoped Conventional Commits commit before reporting the task complete.
- Do not amend, rewrite, or push commits unless the user explicitly asks.

If validation fails or a clean task-only commit cannot be made safely, stop before committing and explain the blocker. A user request to leave changes uncommitted overrides this rule.
