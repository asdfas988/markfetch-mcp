#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Markfetch MCP server.
 *
 * Add to Claude Desktop / Cursor:
 *   {
 *     "mcpServers": {
 *       "markfetch": {
 *         "command": "npx",
 *         "args": ["-y", "markfetch-mcp"],
 *         "env": { "MARKFETCH_API_KEY": "rk_..." }
 *       }
 *     }
 *   }
 *
 * Without a key it uses the public (rate-limited) demo endpoints, so it works
 * out of the box for trying it.
 */
const API_BASE = process.env.MARKFETCH_API_BASE || "https://renderkit-api.fly.dev";
const API_KEY = process.env.MARKFETCH_API_KEY || "";
const prefix = API_KEY ? "/v1" : "/v1/demo";
const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
};

const server = new McpServer({ name: "markfetch", version: "0.1.0" });

server.tool(
  "scrape_url",
  "Fetch a web page and return its main content as clean, LLM-ready markdown. Use this to give the model the content of a URL.",
  { url: z.string().url().describe("The web page URL to read") },
  async ({ url }) => {
    const r = await fetch(`${API_BASE}${prefix}/scrape`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });
    if (!r.ok)
      return { content: [{ type: "text", text: `Error ${r.status}: ${await r.text()}` }], isError: true };
    const d = (await r.json()) as { title?: string; markdown: string };
    return { content: [{ type: "text", text: `# ${d.title ?? url}\n\n${d.markdown}` }] };
  },
);

server.tool(
  "screenshot_url",
  "Capture a screenshot of a web page as a PNG image.",
  { url: z.string().url().describe("The web page URL to screenshot") },
  async ({ url }) => {
    const r = await fetch(`${API_BASE}${prefix}/render`, {
      method: "POST",
      headers,
      body: JSON.stringify({ url, output: "png" }),
    });
    if (!r.ok)
      return { content: [{ type: "text", text: `Error ${r.status}: ${await r.text()}` }], isError: true };
    const buf = Buffer.from(await r.arrayBuffer());
    return { content: [{ type: "image", data: buf.toString("base64"), mimeType: "image/png" }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
