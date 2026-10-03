const versionFiles = [
  "package.json",
  "apps/better-response/package.json",
  "apps/better-response/mcp/app.ts",
  "packages/common/package.json",
  "packages/engawa/package.json",
  "packages/sdk/package.json",
  "plugins/better-response/package.json",
  "plugins/better-response/dist/.codex-plugin/plugin.json",
  "plugins/better-response/dist/.cursor-plugin/plugin.json",
];

// A push to main publishes a dev prerelease. The Release run promotes main to a
// stable version; semantic-release needs a release branch either way, and
// production is the one the dev channel counts from.
export default {
  branches:
    process.env.RELEASE_CHANNEL === "stable"
      ? ["main"]
      : ["production", { name: "main", prerelease: "dev" }],
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    [
      "@semantic-release/exec",
      {
        prepareCmd: "scripts/release.sh prepare ${nextRelease.version}",
        successCmd: "scripts/release.sh publish ${nextRelease.version}",
      },
    ],
    ["@semantic-release/git", { assets: versionFiles }],
    [
      "@semantic-release/github",
      {
        assets: [{ path: ".release/*.zip" }],
        successComment: false,
        failComment: false,
        releasedLabels: false,
      },
    ],
  ],
};
