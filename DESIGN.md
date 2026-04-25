# AI Bill Splitter — Hackathon MVP Design

> **Scope**: Deployable demo showcasing multi-cloud architecture. Focus on the wow-factor workflow: **scan → extract → assign via AI → share payment request natively**.

---

## 1. Overview

| Attribute | Value |
|-----------|-------|
| **Project Name** | AI Bill Splitter (hackathon MVP) |
| **Purpose** | Demo workflow: upload receipt → AI extracts items → assign via LLM → tap to share payment request via native messaging apps. |
| **Target Platform** | Mobile-first PWA (installable, camera access) |
| **Infrastructure** | **AWS + Alibaba Cloud** (multi-cloud demo) |

---

## 2. MVP Features (Demo-Ready)

| ID | Feature | Demo Flow | Priority |
|----|---------|-----------|----------|
| F-01 | Receipt Upload | Camera capture or file picker. | P0 |
| F-02 | OCR Extraction | Vision model returns items + prices + restaurant name. | P0 |
| F-03 | Contact Entry & Item Assignment | UI to add contacts and/or mobile number, items ordered, amount owed. Linked to contacts & TNG's backend for mobile number (TNG shows full name if mobile number entered correctly). Ordered items extracted into dropdown/interactive UI; person setting up selects what current person ordered → prices calculated instantly. | P0 |
| F-04 | Manual Assignment UI | Dropdown per item to pick who ate what. Auto-calculate totals + tax split. | P0 |
| F-05 | **Agentic LLM Split** | User types `"Calvin had nasi lemak, Jet had iced coffee, rojak shared"` → AI **auto-discovers people from the prompt**, looks them up in the contact list (searching for all similar names, allowing user to click on correct contact for confirmation — e.g. if Calvin Chong and Calvin Tan exist, user clicks the correct contact), adds missing contacts, then assigns items and calculates amounts. | P0 |
| F-06 | **TNG/DuitNow Payment Request** | Beside each person's contact and amount owed, have a TNG (and/or DuitNow) button. Clicking button sends payment notification to each user's TNG account. Upon clicking, they are brought to a new page to key in PIN to complete payment. | P0 |
| F-07 | Debt Dashboard (simplified) | List who owes what on the current bill only. No historical tracking. | P1 |
| F-08 | **Payment Status Tracker** | Per-person card shows ✅ (paid) or ❌ (unpaid). Tap to toggle status. | P0 |
| F-09 | Debt Overview Tab | New tab showing all amounts owed to you and amounts you owe to others. | P1 |

**What's OUT of scope for hackathon:**
- Real TNG backend payment settlement loop
- Real WhatsApp Business API (use `wa.me` deep links + Web Share API instead)
- Device contact book integration

### 2.1 Minimum Feature Details

1. **Receipt Scanning**: Receipt scanning button OR retrieve receipt from dynamic QR (POS).

2. **Vision Model Extraction**: Vision model to read and extract restaurant name, ordered items, prices, tax.

3. **UI Details**:
   - Contact management: add contacts and/or mobile number, items ordered, amount owed.
   - Linked to contacts & TNG's backend for mobile number lookup (TNG shows full name if mobile number entered correctly).
   - Ordered items extracted into dropdown/interactive UI; person setting up selects what current person ordered → prices calculated instantly.
   - TNG (and/or DuitNow) payment button beside each person's contact and amount owed.
   - Clicking button sends payment notification to each user's TNG account; upon clicking, they are brought to a new page to key in PIN to complete payment.
   - Debt overview tab to view all owed amounts and amounts they owe to others.

4. **LLM Prompt Layer for Automation with Contact Disambiguation**:
   - Look up contact list to find name.
   - Search for all similar names, allow user to click on correct contact for confirmation.
   - Example: if Calvin Chong and Calvin Tan exist, user clicks the correct contact.

---

## 3. User Flow (Demo Script)

```
1. [Landing Page]
   "Snap or upload your receipt"
   ↓
2. [Upload Receipt]
   User takes photo → loading spinner "Reading your receipt..."
   ↓
3. [Extracted Receipt View]
   ┌─────────────────────────────┐
   │ 🍽️ Restaurant: Nasi Kandar  │
   │                             │
   │ Items extracted:            │
   │ ☐ Nasi Lemak        RM 8.00 │
   │ ☐ Teh Ice           RM 3.50 │
   │ ☐ Iced Coffee       RM 6.00 │
   │ ☐ Rojak            RM 10.00 │
   │ Tax (6%)            RM 1.65 │
   │ ─────────────────────────── │
   │ Total              RM 29.15 │
   └─────────────────────────────┘
   ↓
4. [Add People]
   "Who's splitting this bill?"
   [+ Add Contact]  (manual entry)
   ↓
5. [Assign Items — Two Paths]

   PATH A — Manual:
   Each item has a dropdown: "Who ordered this?"
   → Nasi Lemak: [Calvin ▼]
   → Teh Ice:    [Calvin ▼]
   → Iced Coffee:[Jet ▼]
   → Rojak:      [Shared: Calvin + Jet ▼]
   Auto-calculated amounts update live.

   PATH B — Agentic AI Split (The Wow Factor):
   "Or just tell us:"
   ["Calvin had nasi lemak and teh ice, Jet had iced coffee, rojak shared"]
   [✨ AI Split]

   → AI Agent actions:
     1. 🔍 Discovers people from prompt: "Calvin", "Jet"
     2. 📇 Looks up in contact list:
        - Calvin → FOUND ✅ (+6012-345-6789)
        - Jet    → NOT FOUND ❌
     3. ➕ Auto-adds Jet as new contact (placeholder phone)
     4. 📋 Assigns items to both
     5. 💰 Calculates amounts

   [Add People] section auto-populates:
   [Calvin] [+6012-345-6789] ✅  [Jet] [+60__________] ⚠️ (edit phone)
   ↓
6. [Review, Share & Track]
   ┌─────────────────────────────────────┐
   │ 💰 Calvin owes: RM 11.83            │
   │    [📤 Share Request]  [❌ Unpaid]   │
   │                                     │
   │ 💰 Jet owes:     RM 17.32           │
   │    [📤 Share Request]  [❌ Unpaid]   │
   └─────────────────────────────────────┘

   Tap [❌ Unpaid] → toggles to [✅ Paid]

   Tapping [📤 Share Request] triggers:

   ┌─────────────────────────────┐
   │  iOS / Android Share Sheet  │
   │  ─────────────────────────  │
   │  📱 WhatsApp    Jet         │
   │  💬 Messages    Calvin      │
   │  ✈️ Telegram               │
   │  📧 Email                  │
   │  📋 Copy                   │
   └─────────────────────────────┘

   Pre-filled message:
   "Hey! You were billed RM11.83 for Nasi Kandar.
    Pay me back: https://tngdigital.com.my/pay?to=..."
   ↓
7. [Done]
   "All set! 0 of 2 paid. Track below 👇"
   ┌─────────────────────────────────────┐
   │ ✅ Calvin — PAID     RM 11.83       │
   │ ❌ Jet    — UNPAID   RM 17.32       │
   └─────────────────────────────────────┘
```

### 3.1 Native Share Mechanism

| Platform | Method | Behavior |
|----------|--------|----------|
| **Mobile (iOS/Android)** | Web Share API (`navigator.share()`) | Opens native share sheet with pre-filled text + URL. User picks WhatsApp, Messages, etc. |
| **Desktop** | Web Share API (if supported) OR WhatsApp `wa.me` deep link + fallback copy button | On desktop Safari/Chrome, native share may appear. Otherwise, direct WhatsApp web link. |
| **WhatsApp Direct** | `https://wa.me/<phone>?text=<encoded_msg>` | Skips share sheet, opens WhatsApp directly with pre-filled message. |
| **Fallback** | Copy to clipboard | Always available if share APIs unavailable. |

---

## 4. Multi-Cloud Architecture (Hackathon Demo)

> **Goal**: Demonstrate AWS + Alibaba Cloud working together, not full production resilience.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer (PWA)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Camera Upload│  │ Native Share │  │ Assignment UI│          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
└─────────┼────────────────────────────────────────────────────────┘
          │ HTTPS
┌─────────▼────────────────────────────────────────────────────────┐
│                   API Gateway Layer                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  AWS API Gateway (Primary) → OCR, Split, Message APIs  │     │
│  │  AliCloud API Gateway (Demo route) → Fallback/Health   │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────┐
│ AWS    │  │AliCloud│
│ Lambda │  │   FC   │
│ (OCR)  │  │(Split) │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI & Data Layer                             │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Amazon Textract  │  │ AliCloud     │  │ AliCloud OSS │      │
│  │ + VLM (OCR)      │  │  DashScope   │  │ (Primary     │      │
│  │                  │  │  (Qwen)      │  │  Receipt     │      │
│  └──────────────┬───┘  └──────────────┘  │  Images)     │      │
│                 │                        └──────────────┘      │
│                 ▼                                               │
│  ┌──────────────────┐  ┌──────────────┐                        │
│  │ Bedrock          │  │ AWS S3       │                        │
│  │ Claude/Llama     │  │ (Mirror)     │                        │
│  │ (LLM)            │  │              │                        │
│  └──────────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Component Responsibilities

| Component | Cloud | Responsibility |
|-----------|-------|----------------|
| **PWA Frontend** | Vercel / Netlify | Camera upload, assignment UI, native share integration. |
| **AWS Lambda (OCR)** | AWS | Receipt image → Amazon Textract + VLM → structured items. |
| **AliCloud Function Compute (Split)** | Alibaba Cloud | NLP split logic → AliCloud DashScope (Qwen) → assignments. |
| **Amazon Textract + VLM** | AWS | Best-in-class receipt/document extraction; VLM as supplementary for noisy receipts. |
| **Amazon Bedrock** | AWS | Normalize noisy OCR into structured JSON; natural language split parsing (Claude/Llama). |
| **AliCloud DashScope** | Alibaba Cloud | Fallback/demo LLM (Qwen) to show multi-cloud AI. |
| **AliCloud OSS** | Alibaba Cloud | Primary storage for receipt images. |
| **AWS S3** | AWS | Cross-cloud image mirror / demo storage. |
| **AliCloud DB** | Alibaba Cloud | Persistent data storage. |

### 4.2 Multi-Cloud Demo Narrative for Judges

> *"Our backend uses Amazon Textract + VLM for receipt OCR and Alibaba Cloud DashScope for the LLM bill-splitting. Images land in AliCloud OSS (primary) with a mirror in AWS S3. This shows real multi-cloud resilience — if one provider has an outage, we can failover to the other."*

**For hackathon pragmatism**: The failover logic can be simple — if Bedrock errors, call DashScope. Show both providers responding in the network tab.

---

## 5. Tech Stack

| Layer | Choice | Cloud | Why |
|-------|--------|-------|-----|
| **Frontend** | React + Vite + Tailwind CSS | Vercel | PWA-capable, fast dev, one-click deploy. |
| **Backend** | Python + FastAPI | AWS Lambda + AliCloud FC | Fits both serverless platforms; team knows Python. |
| **OCR** | Amazon Textract (primary for receipts/docs) + VLM (Vision Language Model) | AWS | Best-in-class receipt/document extraction; VLM as supplementary for noisy receipts. |
| **LLM** | Amazon Bedrock (Claude/Llama via Bedrock) | AWS | Normalize noisy OCR into structured JSON; natural language split parsing. |
| **Image Storage** | Alicloud OSS (primary) | Alibaba Cloud | Primary storage for receipt images. |
| **Database** | Alicloud DB | Alibaba Cloud | Persistent data storage. |
| **Auth** | Cognito (or TNG identity — TBD) | AWS | User authentication (needs confirmation). |
| **Async Processing** | SQS + Lambda (TBD) | AWS | Async receipt processing pipeline (needs confirmation). |
| **Notifications** | SNS / EventBridge (TBD) | AWS | Payment notifications, webhooks (needs confirmation). |
| **Observability** | CloudWatch + X-Ray (TBD) | AWS | Logging, tracing, monitoring (needs confirmation). |

**Cost estimate for demo:**
- Hosting: $0 (free tiers / hackathon credits)
- AWS Bedrock: ~$2-5 for demo usage
- AliCloud DashScope: ~$1-3 for demo usage
- S3 + OSS: pennies for a few images

---

## 6. API Endpoints (MVP)

| Method | Path | Cloud | Body | Response |
|--------|------|-------|------|----------|
| `POST` | `/api/ocr` | AWS | `{ image: base64 }` | `{ restaurant, items: [{name, qty, price}], total, tax }` |
| `POST` | `/api/split/nlp` | AliCloud FC | `{ items[], contacts[], prompt }` | `{ discovered_people: [{name, match_status, matched_contact_id, suggested_phone}], assignments: [{person, items, amount}] }` |
| `POST` | `/api/split/manual` | AWS Lambda | `{ items[], assignments[] }` | `{ person_totals: [{person, amount}] }` |
| `POST` | `/api/message` | AWS Lambda | `{ from_name, to_name, amount, restaurant, phone }` | `{ message, tng_link, wa_me_link }` |

---

## 7. Native Share Implementation

### 7.1 Frontend Share Logic (React)

```typescript
async function sharePaymentRequest(person: string, amount: number, restaurant: string, phone: string) {
  const message = `Hey ${person}! You were billed RM${amount} for ${restaurant}. Pay me back: https://tngdigital.com.my/pay?to=DEMO`;
  const waLink = `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;

  // Try native share first (mobile)
  if (navigator.share) {
    await navigator.share({
      title: `Payment Request from ${restaurant}`,
      text: message,
    });
    return;
  }

  // Desktop fallback: open WhatsApp Web directly
  window.open(waLink, '_blank');
}
```

### 7.2 UX Pattern

| Device | Button Label | Action |
|--------|-------------|--------|
| Mobile | **📤 Share Request** | `navigator.share()` → native share sheet |
| Desktop | **💬 Send via WhatsApp** | `wa.me` deep link → WhatsApp Web |
| All | **📋 Copy Message** | Clipboard fallback |

---

## 8. LLM Prompts

### 8.1 OCR Prompt (Amazon Textract + VLM)

```text
You are a receipt parser. Extract ALL items, prices, tax, and total.
Return ONLY valid JSON in this exact format:

{
  "restaurant": "string or null",
  "items": [
    {"name": "string", "quantity": 1, "unit_price": 0.00, "total_price": 0.00}
  ],
  "tax": 0.00,
  "total": 0.00,
  "currency": "MYR"
}

Rules:
- If quantity is not shown, assume 1.
- Include service charges / tax separately.
- Do not add markdown or explanations.
```

### 8.2 Agentic Natural Language Split Prompt (AliCloud Qwen / Claude)

```text
You are an agentic bill-splitting assistant. You have access to a contact list.

Receipt items (with index):
{{items_json}}

Existing contacts:
{{contacts_json}}

Instruction: "{{user_prompt}}"

Return ONLY valid JSON:
{
  "discovered_people": [
    {
      "name": "string",
      "match_status": "found" | "new",
      "matched_contact_id": "string or null",
      "suggested_phone": "string or null"
    }
  ],
  "assignments": [
    {
      "person": "string",
      "items": [{"item_index": int, "share_ratio": float}],
      "amount": float
    }
  ]
}

Agent Rules:
1. DISCOVER: Extract all person names mentioned in the instruction.
2. MATCH: Check if each name matches an existing contact (fuzzy match, case-insensitive).
3. FLAG: Set match_status to "found" if matched, "new" if not in contacts.
4. ASSIGN: Map each item to one or more people. Use share_ratio for shared items.
5. CALCULATE: Pro-rate tax across all items based on subtotal share. Round to 2 decimal places.
6. Return valid JSON only. No markdown, no explanations.
```

---

## 9. File Structure

```
ai-bill-splitter/
├── frontend/                     # React + Vite PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ReceiptUpload.tsx
│   │   │   ├── ExtractedItems.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── AssignmentUI.tsx
│   │   │   ├── NLPSplit.tsx
│   │   │   ├── ShareButton.tsx     # Native share + wa.me + copy
│   │   │   └── StatusTracker.tsx   # ✅ / ❌ payment status toggle
│   │   ├── api.ts
│   │   ├── store.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── aws/                        # AWS Lambda handlers
│   │   ├── ocr_handler.py          # Bedrock Vision OCR
│   │   ├── manual_split_handler.py # Local math
│   │   └── message_handler.py      # Generate share payload
│   ├── alicloud/                   # AliCloud FC handlers
│   │   └── nlp_split_handler.py    # DashScope Qwen split
│   ├── shared/
│   │   └── models.py               # Pydantic schemas
│   ├── requirements.txt
│   └── README.md
├── infra/                          # Terraform / Pulumi (optional)
│   └── main.tf
├── README.md
└── .env.example
```

---

## 10. Extensible State Architecture (Scalability)

> Designed for hackathon speed, but structured so future features slot in without rewrites.

### 10.1 Frontend Store Schema (Zustand)

```typescript
interface AppState {
  // ── Receipt ──
  receipt: {
    id: string;           // UUID — ready for DB persistence
    imageUrl: string;
    restaurant: string;
    items: ReceiptItem[];
    tax: number;
    total: number;
    status: 'uploaded' | 'extracted' | 'split' | 'shared' | 'settled';
    createdAt: string;    // ISO 8601 — future sorting/history
  } | null;

  // ── Contacts ──
  contacts: Contact[];    // Reusable across multiple bills

  // ── Assignments ──
  assignments: Assignment[];  // Person + items + amount + status

  // ── Actions ──
  setReceipt: (r: Receipt) => void;
  addContact: (c: Contact) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  setAssignments: (a: Assignment[]) => void;
  togglePaidStatus: (contactId: string) => void;  // ✅ / ❌
  resetSession: () => void;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  source: 'manual' | 'llm-discovered' | 'tng-lookup';  // extensible
  isTngVerified: boolean;  // future: real TNG integration
  createdAt: string;
}

interface Assignment {
  contactId: string;
  items: { itemIndex: number; shareRatio: number }[];
  amount: number;
  paymentStatus: 'unpaid' | 'paid' | 'declined';  // extensible
  sharedAt: string | null;
  paidAt: string | null;
}
```

**Why this scales:**
- `status` enum on receipt → future workflow states (disputed, refunded, etc.)
- `source` on contact → future imports from phone book, TNG, WhatsApp
- `paymentStatus` enum → future partial payments, declined requests
- `createdAt` / `paidAt` timestamps → future debt dashboard with history
- `id` UUIDs everywhere → drop-in PostgreSQL persistence later

### 10.2 Backend Extensibility

| Current (MVP) | Future Feature | How It Fits |
|---------------|----------------|-------------|
| In-memory state | Persistent DB | Swap `store.ts` for API calls to PostgreSQL. IDs already UUID. |
| Mock TNG link | Real TNG deep-link | `message_handler.py` swaps mock URL for TNG API call. |
| `wa.me` share | WhatsApp Business API | Replace `wa_me_link` with `/api/whatsapp/send` endpoint. |
| Single bill | Debt history | `receipt.status` + `assignment.paymentStatus` enable aggregation queries. |
| Manual toggle | Webhook auto-update | `togglePaidStatus` can be driven by TNG webhook instead of user tap. |

### 10.3 Component Modularity

Each UI component is **feature-agnostic**:
- `ReceiptUpload.tsx` → only handles image → returns `File`
- `ContactForm.tsx` → only handles `Contact` CRUD
- `AssignmentUI.tsx` → renders any `Assignment[]`, regardless of source (manual or LLM)
- `StatusTracker.tsx` → renders `paymentStatus` badge + toggle action
- `ShareButton.tsx` → accepts `message`, `waLink`, `shareData` props — works for any content

New features (e.g., "Remind" button, "Add tip", "Split by percentage") add components without touching existing ones.

---

## 11. Deployment Checklist (Demo Day)

- [ ] Deploy AWS Lambda functions (SAM / Serverless Framework / console)
- [ ] Deploy AliCloud Function Compute functions
- [ ] Configure AWS API Gateway + AliCloud API Gateway
- [ ] Set `OPENAI_API_KEY` or AWS Bedrock credentials
- [ ] Set AliCloud DashScope API key
- [ ] Connect S3 + OSS buckets
- [ ] Deploy frontend to Vercel
- [ ] Update frontend `API_BASE_URL` to AWS API Gateway
- [ ] Test OCR on 2-3 receipts
- [ ] Test natural language split with prepared prompt
- [ ] Test native share on mobile device
- [ ] Prepare judges narrative: *"AWS does OCR, AliCloud does the LLM split, images live in both clouds"*

---

## 12. Post-Hackathon Roadmap

| Feature | Next Step |
|---------|-----------|
| Real TNG deep-link generation | Apply for TNG developer partner API |
| Real WhatsApp Business API | Apply via Meta BSP for verified bot sending |
| Full dual-cloud failover | Implement circuit breakers, cross-cloud DB replication |
| Full SQS async pipeline | Build end-to-end async receipt processing with SQS + Lambda |
| SNS notification integration | Real payment notifications, webhooks, and alerts |
| X-Ray tracing setup | Distributed tracing across AWS and Alibaba Cloud services |
| PWA push notifications | Notify when payment received |

---

## 13. Quick-Start Commands

```bash
# AWS Lambda (local test with sam local)
cd backend/aws
pip install -r requirements.txt
sam local start-api

# AliCloud FC (local test)
cd backend/alicloud
pip install -r requirements.txt
python nlp_split_handler.py  # test locally

# Frontend
cd frontend
npm install
npm run dev

# Deploy frontend
npm run build
vercel --prod
```
