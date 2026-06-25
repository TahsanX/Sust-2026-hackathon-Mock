export type CaseType =
  | "wrong_transfer"
  | "payment_failed"
  | "refund_request"
  | "phishing_or_social_engineering"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type Department =
  | "customer_support"
  | "dispute_resolution"
  | "payments_ops"
  | "fraud_risk";

export type Channel = "app" | "sms" | "call_center" | "merchant_portal";

export type Locale = "bn" | "en" | "mixed";

export interface TicketRequest {
  ticket_id: string;
  channel?: Channel;
  locale?: Locale;
  message: string;
}

export interface TicketResponse {
  ticket_id: string;
  case_type: CaseType;
  severity: Severity;
  department: Department;
  agent_summary: string;
  human_review_required: boolean;
  confidence: number;
}

export interface GeminiClassification {
  case_type: CaseType;
  confidence: number;
  agent_summary: string;
}
