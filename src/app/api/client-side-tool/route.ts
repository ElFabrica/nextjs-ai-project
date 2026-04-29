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
import ImageKit from "imagekit";

const uploadImage = async (image: string) => {
  const imageKit = new ImageKit({
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  });

  const response = await imageKit.upload({
    file: image,
    fileName: "generated_image.jpg",
  });

  return response.url;
};

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

      const imageUrl = await uploadImage(image.base64);

      return imageUrl;
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
  changeBackground: tool({
    description:
      "Replace image background with AI-generated screens base on text promt",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
      backgroundPrompt: z
        .string()
        .describe(
          `Description of the new background (e.g., "modern office", "tropical beach sunset", "mountain landscape")`,
        ),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
  }),
  removeBackground: tool({
    description: "Remove the background of an image",
    inputSchema: z.object({
      imageUrl: z.string().describe("URL of the uploaded image"),
    }),
    outputSchema: z.string().describe("The transformed image URL"),
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
