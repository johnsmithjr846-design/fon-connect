import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const DEFAULT_LLM_MODEL = "google/gemini-3.6-flash";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId?.trim() || undefined;
  let resolveRunId: (value: string | undefined) => void = () => {};
  let runIdResolved = false;
  const runIdReady = new Promise<string | undefined>((resolve) => {
    resolveRunId = resolve;
  });

  const publishRunId = (value?: string) => {
    const nextRunId = value?.trim() || undefined;
    if (!runId && nextRunId) {
      runId = nextRunId;
    }
    if (!runIdResolved) {
      runIdResolved = true;
      resolveRunId(runId);
    }
  };
  if (runId) publishRunId(runId);

  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }

      try {
        const response = await fetch(input, { ...init, headers });
        publishRunId(response.headers.get(LOVABLE_AIG_RUN_ID_HEADER) ?? undefined);
        return response;
      } catch (error) {
        publishRunId(undefined);
        throw error;
      }
    },
    getRunId: () => runId,
    waitForRunId: () => (runId ? Promise.resolve(runId) : runIdReady),
  };
}

export function createLovableAiGatewayProvider(
  lovableApiKey: string,
  initialRunId?: string,
  options?: { structuredOutputs?: boolean },
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch as typeof fetch,
  });

  return Object.assign(provider, {
    getRunId: runIdFetch.getRunId,
    waitForRunId: runIdFetch.waitForRunId,
  });
}

export function getLovableAiGatewayRunId(request: Request) {
  return request.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
}

export function getLovableAiGatewayResponseHeaders(
  providerHeaders: HeadersInit | undefined,
  init?: HeadersInit,
) {
  const headers = new Headers(init);
  const exposedHeaders = new Set(
    (headers.get("Access-Control-Expose-Headers") ?? "")
      .split(",")
      .map((header) => header.trim())
      .filter(Boolean),
  );

  new Headers(providerHeaders).forEach((value, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) {
      headers.set(name, value);
      exposedHeaders.add(name);
    }
  });

  headers.forEach((_, name) => {
    if (name.toLowerCase().startsWith("x-lovable-aig-")) {
      exposedHeaders.add(name);
    }
  });

  if (exposedHeaders.size > 0) {
    headers.set("Access-Control-Expose-Headers", Array.from(exposedHeaders).join(", "));
  }

  return headers;
}

export const FON_SYSTEM_CONTEXT = `Tu es le moteur linguistique de FonConnect, une application béninoise dédiée à la langue fon (fongbe), parlée principalement au Bénin (Cotonou, Abomey, Porto-Novo).

Règles linguistiques :
- Écris le fon avec son orthographe standard, y compris les caractères spéciaux (ɖ, ɛ, ɔ, ŋ, gb, kp) et les tons quand ils sont pertinents.
- Distingue le registre poli (envers un aîné, un inconnu) du registre familier.
- Privilégie les formulations réellement utilisées au quotidien au Bénin (marché, taxi-moto « zémidjan », santé, hôtel, urgence) plutôt qu'une traduction mot à mot.
- Si une expression n'a pas d'équivalent direct, propose la tournure la plus proche et explique-le.
- Ne prétends jamais être Google Traduction : tu es l'IA FonConnect.`;

export function mapStreamErrorMessage(
  response: Response,
  errorMessage: string,
): Response {
  const body = response.body;
  if (!body) return response;

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let done = false;

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) {
            if (buffer) controller.enqueue(encoder.encode(buffer));
            controller.close();
            break;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const payload = trimmed.slice(5).trim();
              if (payload) {
                try {
                  const parsed = JSON.parse(payload);
                  if (parsed.type === "error") {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ ...parsed, errorText: errorMessage })}\n\n`,
                      ),
                    );
                    continue;
                  }
                } catch {
                  // keep original line
                }
              }
            }
            controller.enqueue(encoder.encode(line + "\n"));
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
