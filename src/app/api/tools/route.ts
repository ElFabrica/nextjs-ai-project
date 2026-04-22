import {
  streamText,
  InferUITools,
  UIDataTypes,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { z } from "zod";

import { openai } from "@ai-sdk/openai";

const tools = {
  getWeather: tool({
    description: "Get the weather for a location",
    inputSchema: z.object({
      city: z.string().describe("A The city to get the weather for"),
    }),
    execute: async ({ city }) => {
      if (city === "Gotham city") {
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

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
