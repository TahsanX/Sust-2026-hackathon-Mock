import { z } from "zod";

export const TicketRequestSchema = z.object({
  ticket_id: z.string().min(1, "ticket_id is required"),
  channel: z.enum(["app", "sms", "call_center", "merchant_portal"]).optional(),
  locale: z.enum(["bn", "en", "mixed"]).optional(),
  message: z.string().min(3, "message must be at least 3 characters"),
});

export const GeminiResponseSchema = z.object({
  case_type: z.enum([
    "wrong_transfer",
    "payment_failed",
    "refund_request",
    "phishing_or_social_engineering",
    "other",
  ]),
  confidence: z.number().min(0).max(1),
  agent_summary: z.string().min(1).max(150),
});

export type TicketRequestInput = z.infer<typeof TicketRequestSchema>;
