import { openai } from "@ai-sdk/openai";
import { experimental_generateSpeech as generateSpeech } from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const { audio } = await generateSpeech({
      model: openai.speech("tts-1"),
      text,
      voice: "fable",
      language: "pt-BR",
    });

    //Something was worng on return only "audio.uint8Array"
    return new Response(audio.uint8Array.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": audio.mediaType || "audio/mpeg",
      },
    });
  } catch (err) {
    console.log("Erro gerando audio no back", err);
    return new Response("Falha para gerar o audio solicitado", { status: 500 });
  }
}
