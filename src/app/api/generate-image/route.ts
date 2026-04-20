import { openai } from "@ai-sdk/openai";
import { generateImage } from "ai";
export async function POST(req: Request) {
  const { prompt } = await req.json();
  try {
    const { image } = await generateImage({
      model: openai.imageModel("dall-e-3"),
      prompt,
      size: "1024x1024",
      providerOptions: {
        openai: {
          style: "vivid",
          quality: "hd",
        },
      },
    });

    console.log(image);

    return Response.json(image.base64);
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 },
    );
  }
}
