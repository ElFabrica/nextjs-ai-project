"use client";

import { useState, useRef, useEffect } from "react";

export default function Page() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);

  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setError(null);
    setText("");

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Houve falha ao gerar áudio");
      }

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      const blob = await response.blob();
      audioUrlRef.current = URL.createObjectURL(blob);
      audioRef.current = new Audio(audioUrlRef.current);

      setHasAudio(true);

      audioRef.current.play();

      //   audio.addEventListener("ended", () => {
      //     URL.revokeObjectURL(audioUrl);
      //   });
    } catch (error) {
      console.log("Erro grando o áudio");
      setError(
        error instanceof Error
          ? error.message
          : "Algo deu errado. Por favor tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && <div className="text-center mb-4">Gerando áudio...</div>}

      {hasAudio && !isLoading && (
        <button
          onClick={replayAudio}
          className="mb-4 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Reproduzir áudio
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md mx-auto left-0 right-0 p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      >
        <div className="flex gap-2">
          <input
            className="flex-1 dark:bg-zinc-800 p-2 border border-zinc-300 dark:border-zinc-700 rounded shadow-xl"
            placeholder="Digite o texto que deseja converter em fala"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gerar
          </button>
        </div>
      </form>
    </div>
  );
}
