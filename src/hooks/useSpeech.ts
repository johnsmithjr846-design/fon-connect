import { useCallback, useRef, useState } from "react";

type SpeakLang = "fr" | "en" | "fon";

function chunkText(text: string, maxWords = 250): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const words = (s: string) => (s.match(/\S+/g) ?? []).length;
  for (const sentence of sentences) {
    if (current && words(current) + words(sentence) > maxWords) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    sourcesRef.current = [];
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    async (id: string, text: string, lang: SpeakLang = "fr") => {
      stop();
      const value = text.trim();
      if (!value) return;

      setError(null);
      setSpeakingId(id);

      const controller = new AbortController();
      abortRef.current = controller;
      const ctx = new AudioContext({ sampleRate: 24000 });
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});

      let playhead = 0;
      let pending = new Uint8Array(0);

      const playChunk = (incoming: Uint8Array) => {
        const bytes = new Uint8Array(pending.length + incoming.length);
        bytes.set(pending);
        bytes.set(incoming, pending.length);
        const usable = bytes.length - (bytes.length % 2);
        pending = bytes.slice(usable);
        if (usable === 0) return;
        const samples = new Int16Array(bytes.buffer, 0, usable / 2);
        const floats = Float32Array.from(samples, (s) => s / 32768);
        const buffer = ctx.createBuffer(1, floats.length, 24000);
        buffer.copyToChannel(floats, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        playhead = playhead === 0 ? ctx.currentTime + 0.08 : Math.max(playhead, ctx.currentTime);
        source.start(playhead);
        playhead += buffer.duration;
        sourcesRef.current.push(source);
      };

      try {
        for (const chunk of chunkText(value)) {
          const res = await fetch("/api/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chunk, lang }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            const message = await res.text().catch(() => "");
            throw new Error(message || "La lecture audio a échoué.");
          }

          const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
          let buffered = "";
          while (true) {
            const { value: part, done } = await reader.read();
            if (done) break;
            buffered += part;
            const lines = buffered.split("\n");
            buffered = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const payloadText = line.slice(5).trim();
              if (!payloadText || payloadText === "[DONE]") continue;
              let payload: { type?: string; audio?: string };
              try {
                payload = JSON.parse(payloadText);
              } catch {
                continue;
              }
              if (payload.type !== "speech.audio.delta" || !payload.audio) continue;
              const binary = atob(payload.audio);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              playChunk(bytes);
            }
          }
        }

        const remaining = Math.max(0, playhead - ctx.currentTime);
        window.setTimeout(
          () => {
            setSpeakingId((current) => (current === id ? null : current));
          },
          remaining * 1000 + 200,
        );
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "La lecture audio a échoué.");
        setSpeakingId(null);
      }
    },
    [stop],
  );

  return { speak, stop, speakingId, error, setError };
}
