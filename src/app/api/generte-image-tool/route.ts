import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
  generateImage,
  UIDataTypes,
  InferUITools,
} from "ai";

import { openai } from "@ai-sdk/openai";
import z from "zod";

const tools = {
  generateImage: tool({
    description: "Generate an image fom prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generata an image for"),
    }),
    execute: async ({ prompt }) => {
      const { image } = await generateImage({
        model: openai.imageModel("dall-e-3"),
        prompt,
        size: "1024x1024",
        providerOptions: {
          openai: {
            style: "vivid",
            quality: "hd ",
          },
        },
      });
      return image.base64;
    },
    toModelOutput: () => {
      return {
        type: "content",
        value: [
          {
            type: "text",
            text: "generated image in base64",
          },
        ],
      };
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
      messages: [...(await convertToModelMessages(messages))],
      tools,
      stopWhen: stepCountIs(2),
    });

    result.usage.then((usage) => {
      console.log({
        MessageCount: messages.length,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      });
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error streaming chat completion: ", error);
    return new Response("Failed to stream chat completion", { status: 500 });
  }
}
