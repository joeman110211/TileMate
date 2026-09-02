import { createServerFn } from "@tanstack/react-start";

type AdviceInput = {
  imageDataUrl: string;
  notes?: string;
  jobContext?: string;
};

export const analyseSitePhoto = createServerFn({ method: "POST" })
  .validator((input: AdviceInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Photo advice is not available in this environment." };
    }

    const prompt = [
      "You are a qualified UK wall and floor tiler reviewing a site photo for a quoting app called TileMate.",
      "Give practical survey advice. Be direct. No fluff.",
      "Cover, only where relevant: substrate, level/plumb, wet-zone tanking, falls, existing tiles, obstacles, likely cuts, materials, risks, and what to measure next.",
      "Use short bullet points. UK terminology (tanking, screed, plasterboard, porcelain, C2TE, S1).",
      "If the photo is unclear, say what a better photo should show.",
      data.jobContext ? `Job context: ${data.jobContext}` : "",
      data.notes ? `Tiler notes: ${data.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Could not analyse the photo (${res.status}). Try a smaller image.` };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "No advice came back. Try another photo." };
    return { ok: true as const, text };
  });
