import {
  streamText,
  InferUITools,
  UIDataTypes,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import { z } from "zod";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

import { openai } from "@ai-sdk/openai";

const tools = {
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("A The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      if (city === "Teresina") {
        return "70F and cloudy";
      } else if (city === "Metropolis") {
        return "80F and sunny";
      } else {
        return "Unknown";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const httpTransport = new StreamableHTTPClientTransport(
      new URL(process.env.MCP_TOOL_URL!),
      {
        requestInit: {
          headers: {
            Authorization: `Bearer ${process.env.MCP_TOOL_TOKEN}`,
          },
        },
      },
    );

    const mcpClient = await createMCPClient({
      transport: httpTransport,
    });

    const mcpTooks = await mcpClient.tools();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: await convertToModelMessages(messages),
      tools: { ...mcpTooks, ...tools },
      stopWhen: stepCountIs(2),
      onFinish: async () => {
        await mcpClient.close();
      },
      onError: async (error) => {
        await mcpClient.close();
        console.log("Error during streaming", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
