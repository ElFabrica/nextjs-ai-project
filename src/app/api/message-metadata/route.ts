import { streamText, convertToModelMessages } from "ai";
import type { MyUiMessage } from "./types";

import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: MyUiMessage[] } = await req.json();

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful coding assistant. Keep resposnes under 3 sentences and focuson on pratical examples.",
        },
        ...(await convertToModelMessages(messages)),
      ],
    });

    result.usage.then((usage) => {
      console.log({
        MessageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "start") {
          return {
            createdAt: Date.now(),
          };
        }
        if (part.type === "finish") {
          console.log(part.totalUsage);
          return {
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
