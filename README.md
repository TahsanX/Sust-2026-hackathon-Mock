# QueueStorm Warmup — CRM Ticket Classification API

A production-ready REST API that classifies customer support tickets for a digital finance company using Gemini AI with a rule-based fallback.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check |
| POST | `/sort-ticket` | Classify a CRM ticket |

### GET /health

```json
{ "status": "ok" }
```

### POST /sort-ticket

**Request:**
```json
{
  "ticket_id": "T-001",
  "channel": "app",
  "locale": "en",
  "message": "I sent 5000 taka to a wrong number this morning, please help me get it back"
}
```

**Response:**
```json
{
  "ticket_id": "T-001",
  "case_type": "wrong_transfer",
  "severity": "high",
  "department": "dispute_resolution",
  "agent_summary": "Customer reports sending money to an incorrect recipient and requests recovery.",
  "human_review_required": true,
  "confidence": 0.92
}
```

## Tech Stack

- Node.js + Express.js
- TypeScript
- Zod (validation)
- Google Gemini 1.5 Flash (LLM classification)
- Rule-based fallback

## Local Setup

### Prerequisites

- Node.js 20+
- A Google Gemini API key ([get one here](https://aistudio.google.com/))

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd queuestorm-warmup

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY

# 4. Run in development mode
npm run dev

# 5. Or build and run in production mode
npm run build
npm start
```

The server starts on port `3000` by default. Override with `PORT=8080 npm start`.

## Docker

```bash
# Build image
docker build -t queuestorm-warmup .

# Run container
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key_here queuestorm-warmup
```

## Railway Deployment

1. Push this repository to GitHub.
2. Go to [Railway](https://railway.app) and create a new project from the GitHub repo.
3. In **Settings → Variables**, add:
   - `GEMINI_API_KEY` = your Gemini API key
   - `PORT` = `3000` (Railway sets this automatically, but explicit is fine)
4. Railway auto-detects the `Dockerfile` and builds on every push.
5. Set the **Start Command** to `node dist/server.js` (or leave blank to use `CMD` from Dockerfile).
6. Once deployed, Railway provides a public HTTPS URL — use that as your submission base URL.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PORT` | No | HTTP port (default: 3000) |

## Classification Logic

1. **Gemini AI** (primary): Sends the message to `gemini-1.5-flash` with a structured prompt, parses and validates the JSON response with Zod.
2. **Rule-based fallback** (used when Gemini fails, times out, or returns invalid output): Keyword matching against predefined patterns.

### Case Types & Routing

| case_type | severity | department |
|-----------|----------|------------|
| `wrong_transfer` | high | dispute_resolution |
| `payment_failed` | high | payments_ops |
| `refund_request` | low | customer_support |
| `phishing_or_social_engineering` | critical | fraud_risk |
| `other` | low | customer_support |

`human_review_required` is `true` when severity is `critical` or case_type is `phishing_or_social_engineering`.

## Safety

The `agent_summary` field never asks for or includes PIN, OTP, password, CVV, or card numbers. Any such terms are automatically redacted.

## LLM Used

Yes — Google Gemini 1.5 Flash via `@google/generative-ai` SDK.
