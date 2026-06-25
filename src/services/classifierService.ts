import { CaseType, Department, GeminiClassification, Severity, TicketResponse } from "../types";
import { classifyWithGemini } from "./geminiService";

const KEYWORD_RULES: { type: CaseType; keywords: string[] }[] = [
  {
    type: "phishing_or_social_engineering",
    keywords: ["otp", "pin", "password", "scam", "suspicious call", "verification code"],
  },
  {
    type: "wrong_transfer",
    keywords: ["wrong number", "wrong recipient", "sent by mistake", "mistaken transfer"],
  },
  {
    type: "payment_failed",
    keywords: ["payment failed", "transaction failed", "balance deducted", "money deducted"],
  },
  {
    type: "refund_request",
    keywords: ["refund", "money back", "return payment"],
  },
];

function ruleBasedClassify(message: string): GeminiClassification {
  const lower = message.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        case_type: rule.type,
        confidence: 0.75,
        agent_summary: buildFallbackSummary(rule.type, message),
      };
    }
  }

  return {
    case_type: "other",
    confidence: 0.6,
    agent_summary: buildFallbackSummary("other", message),
  };
}

function buildFallbackSummary(caseType: CaseType, _message: string): string {
  const summaries: Record<CaseType, string> = {
    wrong_transfer: "Customer reports sending money to an incorrect recipient and requests recovery.",
    payment_failed: "Customer reports a failed transaction with a possible balance deduction.",
    refund_request: "Customer is requesting a refund for a recent transaction.",
    phishing_or_social_engineering: "Customer reports a suspicious contact that may be a social engineering attempt.",
    other: "Customer has submitted a general support inquiry.",
  };
  return summaries[caseType];
}

function getSeverityAndDepartment(caseType: CaseType): {
  severity: Severity;
  department: Department;
} {
  const map: Record<CaseType, { severity: Severity; department: Department }> = {
    wrong_transfer: { severity: "high", department: "dispute_resolution" },
    payment_failed: { severity: "high", department: "payments_ops" },
    refund_request: { severity: "low", department: "customer_support" },
    phishing_or_social_engineering: { severity: "critical", department: "fraud_risk" },
    other: { severity: "low", department: "customer_support" },
  };
  return map[caseType];
}

export async function classifyTicket(
  ticketId: string,
  message: string
): Promise<TicketResponse> {
  let classification = await classifyWithGemini(message);

  if (!classification) {
    classification = ruleBasedClassify(message);
  }

  const { severity, department } = getSeverityAndDepartment(classification.case_type);

  const human_review_required =
    severity === "critical" || classification.case_type === "phishing_or_social_engineering";

  return {
    ticket_id: ticketId,
    case_type: classification.case_type,
    severity,
    department,
    agent_summary: classification.agent_summary,
    human_review_required,
    confidence: classification.confidence,
  };
}
