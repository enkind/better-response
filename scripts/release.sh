#!/usr/bin/env bash
# Called by semantic-release (release.config.mjs). RELEASE_CHANNEL is "dev" or
# "stable"; the stable channel also needs MCP_URL and the Vercel variables.
set -euo pipefail

step=$1
version=$2
dist=plugins/better-response/dist

edit() { jq --arg url "${MCP_URL:-}" --arg version "$version" "$2" "$1" > "$1.tmp" && mv "$1.tmp" "$1"; }

# Rewrites a plugin directory from main's dev manifests to the production ones.
use_production_manifests() {
  edit "$1/.mcp.json" '.mcpServers.visualize.url = $url'
  edit "$1/.cursor-plugin/plugin.json" '.displayName = "Better Response" | .logo = "./better-response.svg" | .mcpServers.visualize.url = $url'
  edit "$1/.codex-plugin/plugin.json" '.interface.displayName = "Better Response" | .interface.composerIcon = "./better-response.svg" | .interface.logo = "./better-response.svg"'
  rm -f "$1/better-response-dev.svg"
}

case $step in
  prepare)
    for file in package.json apps/better-response/package.json packages/common/package.json packages/engawa/package.json packages/sdk/package.json plugins/better-response/package.json $dist/.codex-plugin/plugin.json $dist/.cursor-plugin/plugin.json; do
      edit "$file" '.version = $version'
    done
    perl -pi -e "s/version: \"[^\"]+\"/version: \"$version\"/" apps/better-response/mcp/app.ts

    if [ "$RELEASE_CHANNEL" = stable ]; then
      npx --yes vercel@48.2.9 deploy --prod --yes --token "$VERCEL_TOKEN"
      node apps/better-response/scripts/probe-mcp.mjs "$MCP_URL"
    fi

    # The ZIP has the shape the ChatGPT plugin upload expects: one top-level
    # plugin folder without the Cursor manifest.
    package=$(mktemp -d)/better-response
    cp -R $dist "$package"
    if [ "$RELEASE_CHANNEL" = stable ]; then
      use_production_manifests "$package"
    fi
    rm -rf "$package/.cursor-plugin"
    mkdir -p .release
    (cd "$(dirname "$package")" && zip -qr - better-response) > ".release/better-response-$version.zip"
    ;;
  publish)
    [ "$RELEASE_CHANNEL" = stable ] || exit 0
    use_production_manifests $dist
    git add $dist
    git commit -qm "chore(release): publish v$version to production"
    git push --force origin HEAD:refs/heads/production
    ;;
esac
