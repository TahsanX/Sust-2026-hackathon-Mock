import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiClassification } from "../types";
import { GeminiResponseSchema } from "../validators/ticketValidator";

const GEMINI_TIMEOUT_MS = 20000;

function buildPrompt(message: string): string {
  return `You are a financial customer support classifier for a digital payment company in Bangladesh.

Classify the following customer message and respond with ONLY valid JSON — no markdown, no explanation.

Customer message: "${message}"

Return exactly this JSON structure:
{
  "case_type": "<one of: wrong_transfer | payment_failed | refund_request | phishing_or_social_engineering | other>",
  "confidence": <float between 0.0 and 1.0>,
  "agent_summary": "<one neutral sentence, max 150 characters, describing the issue — never ask for PIN, OTP, password, or card number>"
}

Classification rules:
- wrong_transfer: customer sent money to wrong number or recipient
- payment_failed: transaction failed, balance may have been deducted
- refund_request: customer wants a refund or money back
- phishing_or_social_engineering: suspicious calls, someone asking for OTP, PIN, password, or verification code
- other: anything else

Respond with raw JSON only.`;
}

export async function classifyWithGemini(
  message: string
): Promise<GeminiClassification | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), GEMINI_TIMEOUT_MS)
    );

    const geminiPromise = model.generateContent(buildPrompt(message));

    const result = await Promise.race([geminiPromise, timeoutPromise]);
    if (!result) return null;

    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    const parsed = JSON.parse(cleaned);
    const validated = GeminiResponseSchema.safeParse(parsed);

    if (!validated.success) return null;

    // Safety: strip sensitive words from summary
    const safeSummary = sanitizeSummary(validated.data.agent_summary);
    return { ...validated.data, agent_summary: safeSummary };
  } catch {
    return null;
  }
}

function sanitizeSummary(summary: string): string {
  const forbidden = /\b(otp|pin|password|cvv|card number)\b/gi;
  return summary.replace(forbidden, "[REDACTED]");
}
