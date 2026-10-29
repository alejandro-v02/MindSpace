import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "mindspace-mcp-server",
  version: "0.1.0",
});

// Tools are registered here as they're built, e.g. server.registerTool("read_repo", ...).
// Start with read-only permissions per docs/architecture.md section 12 (Calidad y seguridad).

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("mindspace-mcp-server failed to start", error);
  process.exit(1);
});
