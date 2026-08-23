import { invokeLLM } from "./_core/llm";

export const ORIGINAL_IMAGE_REJECTION_MESSAGE =
  "عذراً، ينبغي إرفاق صور أصلية وواقعية من تصويركم المباشر لضمان الشفافية ومصداقية العرض على المنصة.";

export type ImageVerificationResult = {
  accepted: boolean;
  confidence: number;
  reasons: string[];
};

const verificationSchema = {
  name: "original_image_verification",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      isRealistic: { type: "boolean" },
      isPromotional: { type: "boolean" },
      isStockLike: { type: "boolean" },
      isAiGenerated: { type: "boolean" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reasons: { type: "array", items: { type: "string" }, maxItems: 5 },
    },
    required: ["isRealistic", "isPromotional", "isStockLike", "isAiGenerated", "confidence", "reasons"],
  },
  strict: true,
} as const;

function readAssistantJson(result: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Vision AI returned no text result");
  return JSON.parse(content) as {
    isRealistic: boolean;
    isPromotional: boolean;
    isStockLike: boolean;
    isAiGenerated: boolean;
    confidence: number;
    reasons: string[];
  };
}

export async function verifyOriginalListingImage(input: {
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}): Promise<ImageVerificationResult> {
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a strict marketplace image authenticity screener. Assess only visible evidence. Accept only realistic, user-captured-looking photos of the listed asset. Reject stock-photo-like, promotional graphic, screenshots, collages, watermarks, heavy marketing edits, and AI-generated-looking images. You cannot prove provenance or capture source; use conservative decisions and explain uncertainty.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Classify this listing image. Return only the requested JSON schema. Set accepted only when it is realistic and none of the rejection flags apply with confidence at least 0.78.",
            },
            { type: "image_url", image_url: { url: `data:${input.mimeType};base64,${input.base64}`, detail: "high" } },
          ],
        },
      ],
      outputSchema: verificationSchema,
      maxTokens: 500,
    });

    const analysis = readAssistantJson(result);
    const confidence = Math.max(0, Math.min(1, Number(analysis.confidence)));
    const rejectedBySignal = !analysis.isRealistic || analysis.isPromotional || analysis.isStockLike || analysis.isAiGenerated;
    return {
      accepted: !rejectedBySignal && confidence >= 0.78,
      confidence,
      reasons: Array.isArray(analysis.reasons) ? analysis.reasons.slice(0, 5) : [],
    };
  } catch {
    return {
      accepted: false,
      confidence: 0,
      reasons: ["تعذر التحقق من أصلية الصورة حالياً. يرجى المحاولة بصورة واضحة وواقعية أخرى."],
    };
  }
}
