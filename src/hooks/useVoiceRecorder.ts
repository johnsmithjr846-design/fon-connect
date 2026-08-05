import { useCallback, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "transcribing";

function encodeWav(chunks: Float32Array[], sampleRate: number, targetRate = 16000): Blob {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  const ratio = sampleRate / targetRate;
  const length = ratio > 1 ? Math.floor(merged.length / ratio) : merged.length;
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    samples[i] = merged[Math.min(merged.length - 1, Math.floor(i * (ratio > 1 ? ratio : 1)))] ?? 0;
  }
  const rate = ratio > 1 ? targetRate : sampleRate;

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let pos = 44;
  for (const sample of samples) {
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export function useVoiceRecorder(options?: { language?: string }) {
  const language = options?.language;
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);

  const cleanup = useCallback(() => {
    nodeRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => {});
    nodeRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume().catch(() => {});
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      node.onaudioprocess = (e) => {
        chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      source.connect(node);
      node.connect(ctx.destination);
      sourceRef.current = source;
      nodeRef.current = node;
      setStatus("recording");
    } catch (cause) {
      cleanup();
      setStatus("idle");
      const insecure = !window.isSecureContext;
      const unsupported = !navigator.mediaDevices?.getUserMedia;
      const denied = cause instanceof DOMException && cause.name === "NotAllowedError";
      setError(
        insecure
          ? "Le micro exige une connexion HTTPS sécurisée."
          : unsupported
            ? "Cette application APK n'expose pas le micro à la page web. Activez l'autorisation microphone dans AppGeyser et dans les réglages Android."
            : denied
              ? "Accès au micro refusé. Autorisez le microphone pour l'application dans les réglages Android."
              : "Micro indisponible. Fermez les autres applications utilisant le micro puis réessayez.",
      );
    }
  }, [cleanup]);

  const cancel = useCallback(() => {
    cleanup();
    chunksRef.current = [];
    setStatus("idle");
  }, [cleanup]);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    if (status !== "recording") return null;
    const sampleRate = ctxRef.current?.sampleRate ?? 44100;
    const chunks = chunksRef.current;
    cleanup();
    chunksRef.current = [];

    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 4096) {
      setStatus("idle");
      setError("Enregistrement trop court. Parlez un peu plus longtemps.");
      return null;
    }

    setStatus("transcribing");
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.wav");
      if (language) form.append("language", language);
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "La transcription a échoué. Réessayez.");
        return null;
      }
      if (!data.text) {
        setError("Aucune parole détectée. Réessayez.");
        return null;
      }
      return data.text;
    } catch {
      setError("La transcription a échoué. Vérifiez votre connexion.");
      return null;
    } finally {
      setStatus("idle");
    }
  }, [cleanup, language, status]);

  return { status, error, setError, start, stopAndTranscribe, cancel };
}
