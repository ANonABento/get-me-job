# `@slothing/mcp`

Model Context Protocol server for [Slothing](https://slothing.work). Exposes a
small set of read/write tools to MCP-capable agent runtimes (Claude Desktop,
Claude Code, Cursor, the Anthropic Agent SDK, custom hosts) over stdio.

The server is a thin adapter over the same extension-token endpoints the
[Slothing browser extension](../../apps/extension) uses — no new auth model,
no new business logic. If your Slothing instance trusts your extension token,
it trusts this MCP server.

## Quick start

```bash
# One-shot run with pnpm dlx (no install needed):
SLOTHING_TOKEN=... SLOTHING_API_URL=http://localhost:3000 pnpm dlx @slothing/mcp
```

Or wire it into an MCP host config (see below) and let the host launch it.

## Tools

| Tool                     | What it does                                                                                      | Underlying route                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `get_profile`            | Fetch the user's profile + pre-computed auto-fill values                                          | `GET /api/extension/profile`                     |
| `list_opportunities`     | List tracked opportunities, optionally filtered by status                                         | `GET /api/extension/opportunities`               |
| `get_opportunity_detail` | Fetch a single opportunity by id                                                                  | `GET /api/extension/opportunities/[id]`          |
| `search_answer_bank`     | Find similar previously-saved answers for a given question (returns up to 5 ranked matches)       | `POST /api/extension/learned-answers/search`     |
| `save_answer`            | Persist a question/answer pair to the user's answer bank (updates existing entry on normalized-Q) | `POST /api/extension/learned-answers`            |
| `slothing_push_job`      | Create a pending/applied opportunity from a structured scraped or agent-collected job payload     | `POST /api/opportunities/from-extension`         |
| `slothing_update_status` | Update a tracked opportunity's status                                                             | `PATCH /api/extension/opportunities/[id]/status` |
| `slothing_scrape_url`    | Scrape a supported job-board URL into a structured opportunity preview without saving it          | `POST /api/extension/opportunities/scrape`       |

All tools require a valid `X-Extension-Token`. The server surfaces auth
failures back to the MCP client as standard tool errors (`isError: true`)
with a clear message telling the user to re-mint the token.

## Environment

| Var                        | Required | Description                                                                |
| -------------------------- | -------- | -------------------------------------------------------------------------- |
| `SLOTHING_TOKEN`           | yes      | Extension token minted via `POST /api/extension/auth` on your Slothing app |
| `SLOTHING_API_URL`         | yes      | Base URL of the Slothing web app (e.g. `http://localhost:3000`)            |
| `SLOTHING_EXTENSION_TOKEN` | no       | Legacy alias for `SLOTHING_TOKEN`                                          |
| `SLOTHING_BASE_URL`        | no       | Legacy alias for `SLOTHING_API_URL`                                        |

Minting a token: sign in to your local Slothing instance, then `POST` to
`/api/extension/auth` with your authenticated session — the same flow the
Slothing extension uses. Tokens currently inherit the extension's TTL.

## Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```jsonc
{
  "mcpServers": {
    "slothing": {
      "command": "pnpm",
      "args": ["dlx", "@slothing/mcp"],
      "env": {
        "SLOTHING_TOKEN": "paste-your-extension-token-here",
        "SLOTHING_API_URL": "http://localhost:3000",
      },
    },
  },
}
```

Restart Claude Desktop and the Slothing tools will appear under the Slothing
server in the tool list.

## Cursor

Add to `~/.cursor/mcp.json` (global) or `<repo>/.cursor/mcp.json` (project):

```jsonc
{
  "mcpServers": {
    "slothing": {
      "command": "pnpm",
      "args": ["dlx", "@slothing/mcp"],
      "env": {
        "SLOTHING_TOKEN": "paste-your-extension-token-here",
        "SLOTHING_API_URL": "http://localhost:3000",
      },
    },
  },
}
```

## Claude Code

Add to `<repo>/.mcp.json`:

```jsonc
{
  "mcpServers": {
    "slothing": {
      "command": "pnpm",
      "args": ["dlx", "@slothing/mcp"],
      "env": {
        "SLOTHING_TOKEN": "paste-your-extension-token-here",
        "SLOTHING_API_URL": "http://localhost:3000",
      },
    },
  },
}
```

## Bad-token behaviour

A rejected token (HTTP 401 from any of the wrapped endpoints) is converted
into a tool error result of the form:

```jsonc
{
  "content": [
    {
      "type": "text",
      "text": "Slothing rejected the extension token (401). Set SLOTHING_TOKEN to a valid token minted via POST /api/extension/auth on your Slothing instance.",
    },
  ],
  "isError": true,
}
```

This is the standard MCP shape — the calling agent sees a clean tool error
instead of a transport-level disconnect.

## Development

```bash
# Build TypeScript -> dist/
pnpm --filter @slothing/mcp build

# Type-check only
pnpm --filter @slothing/mcp type-check

# Run the integration tests (uses InMemoryTransport)
pnpm --filter @slothing/mcp test:run
```

## Status

`v0.1.0` — first cut. Not yet published to npm. After review the package
will go out under `@slothing/mcp` so `pnpm dlx @slothing/mcp` works without
a local checkout.
