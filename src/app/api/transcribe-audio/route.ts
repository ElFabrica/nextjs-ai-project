export async function POST(req: Request) {
  const formData = await req.formData();

  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    return new Response("No audio file provider", { status: 400 });
  }
}
