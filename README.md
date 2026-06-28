# markfetch-mcp

MCP server for **Markfetch** — let Claude, Cursor, or any MCP client **read any
web page as clean markdown** or **screenshot it**, with one line of config.

Built for AI agents: turn a URL into LLM-ready context in one tool call.

## Install

Add to your MCP client config (Claude Desktop, Cursor, Windsurf, …):

```json
{
  "mcpServers": {
    "markfetch": {
      "command": "npx",
      "args": ["-y", "markfetch-mcp"],
      "env": { "MARKFETCH_API_KEY": "rk_your_key" }
    }
  }
}
```

No key? It works out of the box on the public rate-limited demo. Get a free key
(500 requests/mo, no card) at https://markfetch.com.

## Tools

| Tool | What it does |
|------|--------------|
| `scrape_url(url)` | Fetches the page (real Chromium, waits for it to render) and returns the main content as clean, LLM-ready markdown. |
| `screenshot_url(url)` | Returns a PNG screenshot of the page. |

## Env
- `MARKFETCH_API_KEY` — your key (optional; falls back to the demo tier).
- `MARKFETCH_API_BASE` — override the API base URL.

MIT licensed.
