# CheckMate 🧾✨

**AI-Powered Bill Splitter for the Touch 'n Go (TNG) eWallet Ecosystem**

> Ever had that awkward moment when the bill arrives and everyone suddenly becomes a mathematician? *"I had the salad... minus the avocado... plus tax... divided by..."* Stop the madness. **CheckMate** splits bills faster than your friend can say *"I'll TnG you later"* (and actually never does)!

Snap a receipt. Let AI extract every item. Split the bill with natural language. Share payment requests via TNG & DuitNow — all in seconds.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=amazonaws&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?logo=amazondynamodb&logoColor=white)
![Alibaba Cloud](https://img.shields.io/badge/Alibaba-Qwen_AI-FF6A00?logo=alibabacloud&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform&logoColor=white)

---

## 🚀 The Vision: From POS to Payment in Seconds

**Imagine this:** You're at a restaurant with friends. You scan the QR code to pay with TNG eWallet. The moment you complete payment, CheckMate automatically receives the digital receipt from the POS system. No photo needed. No manual entry. The receipt is already parsed, items extracted, and ready to split.

**The future of bill splitting isn't about taking photos — it's about seamless integration with modern POS systems.** CheckMate is built to bridge that gap, starting with manual receipt uploads today and evolving toward real-time POS integration tomorrow.

---

## 🎯 Overview

**CheckMate** is a mobile-first Progressive Web App (PWA) that transforms bill splitting from a tedious chore into a delightful, AI-powered experience. Users photograph a receipt, and within seconds, Alibaba Cloud's **Qwen Vision-Language Model** extracts every item, price, tax, and service charge with remarkable accuracy.

Splitting is as simple as typing a sentence: *"Calvin had nasi lemak, Jet had iced coffee, rojak shared"* — or using the intuitive manual assignment interface. The app calculates proportional splits including tax and service charges, then generates shareable **TNG eWallet** and **DuitNow** deep links. Recipients receive pre-filled payment requests via WhatsApp, Telegram, or Messages thanks to the **Web Share API**, with seamless clipboard fallback for desktop users.

What sets CheckMate apart is its **genuine multi-cloud architecture**. The backend spans **AWS** (Lambda, API Gateway, DynamoDB) and **Alibaba Cloud** (DashScope Qwen AI, OSS storage), with every component provisioned through **Terraform** for reproducible, version-controlled infrastructure.

---

## 🎬 Demo Videos

### Full App Walkthrough
Experience CheckMate in action — from receipt upload to payment completion:

(https://github.com/user-attachments/assets/43b28910-bced-4e0e-984b-3604c4f26423)

**[Drag and drop your video here]**

> **📝 To add videos:** Edit this README on GitHub, then drag and drop the `.mov` files from `demo-videos/` folder directly into the editor. GitHub will automatically upload and embed them!

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📸 **Receipt Upload** | Capture receipts via camera or file picker. Optimized for mobile PWA with instant preview. |
| 🤖 **AI-Powered OCR** | Qwen Vision-Language Model reads receipt images and returns structured JSON with items, prices, tax, and totals. |
| 🗣️ **Natural Language Splitting** | Type *"Calvin had nasi lemak, Jet had iced coffee, rojak shared"* and AI auto-discovers people, resolves contact ambiguity, assigns items, and calculates amounts. |
| 🎛️ **Manual Assignment UI** | Interactive dropdowns per item let users manually pick who ordered what, with live total calculation. |
| 🧮 **Smart Tax & Service Distribution** | Tax and service charges are proportionally distributed based on each person's subtotal share — no mental math required. |
| 💳 **TNG & DuitNow Payment Links** | Auto-generated deep links (`tngd://`) send recipients straight to the TNG eWallet or DuitNow payment flow. |
| 📤 **Native Share Integration** | Web Share API opens the device's native share sheet (iOS/Android). Falls back to WhatsApp `wa.me` links or clipboard copy on desktop. |
| ✅ **Payment Status Tracking** | Per-person cards show paid/unpaid status. Tap to toggle. Host gets an instant dashboard of settlement progress. |
| 📜 **Transaction History** | Complete audit trail of all splits, payment requests, and settlements stored in DynamoDB. |
| 👥 **Contact Management** | Search and manage frequent contacts with fuzzy matching and favorites. |

---

## 🏗️ Architecture

CheckMate runs on a **multi-cloud architecture** spanning **AWS** and **Alibaba Cloud**, designed to showcase real cross-cloud collaboration. Each cloud provider handles the workloads it excels at, connected via secure HTTPS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (React 19 PWA)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Camera Upload │  │ Native Share │  │ Assignment UI│  │ Payment Links│   │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────┼───────────────────────────────────────────────────────────────────┘
          │ HTTPS / TLS 1.3
┌─────────▼───────────────────────────────────────────────────────────────────┐
│              AWS API Gateway (HTTP API v2)                                  │
│         Primary Ingress · CORS · Request Validation                         │
│         Endpoint: fs05jjlase.execute-api.ap-southeast-1.amazonaws.com       │
└─────────┬───────────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────────────────────┐
│           AWS Lambda (Python 3.12) — Serverless Compute                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Handlers:                                                           │   │
│  │  • parse_bill.py          — AI receipt parsing & NLP splitting       │   │
│  │  • create_split_session.py — Bill splitting logic & validation       │   │
│  │  • create_payment_requests.py — TNG/DuitNow link generation          │   │
│  │  • get_receipts.py        — Receipt retrieval & filtering            │   │
│  │  • get_contacts.py        — Contact search & management              │   │
│  │  • get_history.py         — Transaction history & audit trail        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────────────────┘
          │
          ├──────────────────────────────────────────────────────────────────┐
          │                                                                  │
┌─────────▼─────────────────────┐                  ┌─────────▼──────────────┐
│   AWS DynamoDB (NoSQL)        │                  │  Alibaba Cloud         │
│   ┌───────────────────────┐   │                  │  DashScope API         │
│   │ BillSplitter-Users    │   │                  │  ┌──────────────────┐  │
│   │ BillSplitter-Receipts │   │                  │  │ Qwen-VL-Plus     │  │
│   │ BillSplitter-Sessions │   │                  │  │ Vision OCR       │  │
│   │ BillSplitter-Payments │   │                  │  └──────────────────┘  │
│   │ BillSplitter-History  │   │                  │  ┌──────────────────┐  │
│   └───────────────────────┘   │                  │  │ Qwen-Plus        │  │
│   • GSI: user_id-status       │                  │  │ NLP Parsing      │  │
│   • GSI: split_id-index       │                  │  └──────────────────┘  │
└───────────────────────────────┘                  └────────────────────────┘
```

### **Data Flow**

1. **Receipt Upload** → User captures/uploads receipt image
2. **AI OCR** → Lambda calls Alibaba DashScope Qwen-VL-Plus for vision extraction
3. **Structured Data** → Receipt items, prices, tax, service charge returned as JSON
4. **Natural Language Split** → User types split instructions, Lambda calls Qwen-Plus for NLP parsing
5. **Contact Resolution** → Fuzzy matching against DynamoDB contacts
6. **Payment Generation** → TNG/DuitNow deep links created per person
7. **Share** → Web Share API or WhatsApp links distribute payment requests
8. **Status Tracking** → DynamoDB stores payment status, updated in real-time

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19.2.5** — Latest React with concurrent features and automatic batching
- **Vite 8.0.10** — Lightning-fast HMR and optimized production builds
- **Lucide React 1.11** — Beautiful, consistent icon system
- **Progressive Web App (PWA)** — Installable, offline-capable, mobile-first
- **Web Share API** — Native sharing on iOS/Android
- **Camera API** — Direct camera access for receipt capture
- **Multi-Page Build** — Separate entry points for main app and recipient payment view

### **Backend**
- **AWS Lambda (Python 3.12)** — Serverless compute with 512MB memory, 30s timeout
- **AWS API Gateway (HTTP API v2)** — RESTful API with CORS support
- **AWS DynamoDB** — NoSQL database with GSI for efficient querying
  - `BillSplitter-Users` — Contact management
  - `BillSplitter-Receipts` — Receipt storage with status tracking
  - `BillSplitter-SplitSessions` — Bill splitting sessions
  - `BillSplitter-PaymentRequests` — Payment request tracking
  - `BillSplitter-TransactionHistory` — Complete audit trail
- **Boto3 1.26+** — AWS SDK for Python

### **AI & Cloud Services**
- **Alibaba Cloud DashScope** — AI inference platform
  - **Qwen-VL-Plus** — Vision-language model for receipt OCR (45s timeout)
  - **Qwen-Plus** — Large language model for NLP parsing (25s timeout)
- **Alibaba Cloud OSS** — Object storage for receipt images (S3-compatible API)
- **Alibaba Cloud Tair** — Redis-compatible cache for session management

### **Infrastructure**
- **Terraform** — Infrastructure as Code (IaC) for reproducible deployments
- **Multi-Cloud VPN** — Secure AWS ↔ Alibaba Cloud connectivity
- **AWS IAM** — Fine-grained access control with least-privilege policies
- **Environment Variables** — Centralized configuration via `config.py`

### **Payment Integration**
- **TNG eWallet Deep Links** — `tngd://` protocol for instant payment requests
- **DuitNow QR** — Malaysia's national QR payment standard
- **WhatsApp Business API** — `wa.me` links for payment request sharing

---

## 📦 Project Structure

```
CheckMate/
├── backend/                          # AWS Lambda handlers
│   ├── handlers/
│   │   ├── parse_bill.py            # AI receipt OCR & NLP parsing
│   │   ├── create_split_session.py  # Bill splitting logic
│   │   ├── create_payment_requests.py # TNG/DuitNow link generation
│   │   ├── get_receipts.py          # Receipt retrieval
│   │   ├── get_contacts.py          # Contact search & management
│   │   └── get_history.py           # Transaction history
│   ├── models.py                    # TypedDict data models
│   ├── repository.py                # DynamoDB data access layer
│   ├── config.py                    # Centralized configuration
│   ├── utils.py                     # Response helpers
│   ├── requirements.txt             # Python dependencies (boto3)
│   └── scripts/
│       ├── deploy-lambdas.sh        # Lambda deployment automation
│       └── seed_data.py             # Sample data generator
│
├── bill-splitter-frontend-react/    # React 19 PWA
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomeScreen.jsx       # Main dashboard
│   │   │   ├── ReceiptsListScreen.jsx # Receipt history
│   │   │   ├── PaymentRequestScreen.jsx # Payment request creation
│   │   │   ├── PaymentConfirmScreen.jsx # Payment confirmation
│   │   │   ├── PaymentSuccessScreen.jsx # Success state
│   │   │   ├── NotificationScreen.jsx # Notification center
│   │   │   └── BannerNotification.jsx # Toast notifications
│   │   ├── components/steps/
│   │   │   ├── ReceiptStep.jsx      # Receipt upload
│   │   │   ├── AIParseStep.jsx      # AI parsing UI
│   │   │   ├── SplitStep.jsx        # Bill splitting
│   │   │   ├── ConfirmStep.jsx      # Review & confirm
│   │   │   └── PaymentStep.jsx      # Payment generation
│   │   ├── components/modals/
│   │   │   ├── UploadModal.jsx      # Receipt upload modal
│   │   │   └── ContactModal.jsx     # Contact picker
│   │   ├── services/
│   │   │   ├── api.js               # Backend API client
│   │   │   ├── traceApi.js          # TNG integration
│   │   │   ├── webhookService.js    # Payment webhooks
│   │   │   └── parseBillGatewaySafe.js # AI parsing wrapper
│   │   └── App.jsx                  # Main app component
│   ├── vite.config.js               # Vite configuration
│   ├── vite.config.recipient.js     # Recipient view config
│   ├── package.json                 # Dependencies (React 19, Vite 8)
│   ├── index.html                   # Main app entry
│   └── recipient.html               # Recipient payment view
│
├── infrastructure/                   # Terraform IaC
│   ├── modules/
│   │   ├── aws/                     # AWS resources
│   │   │   ├── lambda.tf            # Lambda functions
│   │   │   ├── api_gateway.tf       # API Gateway HTTP API
│   │   │   ├── iam.tf               # IAM roles & policies
│   │   │   ├── s3.tf                # S3 buckets
│   │   │   ├── vpc.tf               # VPC & networking
│   │   │   └── vpn.tf               # VPN gateway
│   │   └── alicloud/                # Alibaba Cloud resources
│   │       ├── oss.tf               # Object storage
│   │       ├── fc.tf                # Function Compute
│   │       ├── api_gateway.tf       # API Gateway
│   │       ├── vpc.tf               # VPC & networking
│   │       └── vpn.tf               # VPN gateway
│   ├── main.tf                      # Root module
│   ├── variables.tf                 # Input variables
│   ├── outputs.tf                   # Output values
│   └── terraform.tfvars.example     # Example configuration
│
└── deploy-artifacts/                 # Build outputs
    ├── frontend-amplify.zip         # AWS Amplify deployment
    ├── frontend-clean.zip           # Static hosting
    └── backend-source.zip           # Lambda deployment package
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20+
- Python 3.12+
- AWS CLI configured
- Alibaba Cloud CLI configured (optional)
- Terraform 1.5+ (for infrastructure deployment)

### **Local Development**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nitya-Kanna/CheckMate.git
   cd CheckMate
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your AWS/Alibaba Cloud credentials
   ```

3. **Setup Frontend**
   ```bash
   cd bill-splitter-frontend-react
   npm install
   cp .env.example .env
   # Edit .env with your API Gateway URL
   npm run dev
   ```

4. **Deploy Infrastructure (Optional)**
   ```bash
   cd infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

### **Environment Variables**

**Backend (`backend/.env`)**
```bash
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

ALIBABA_API_KEY=your_alibaba_dashscope_key
ALIBABA_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
ALIBABA_MODEL=qwen-plus
ALIBABA_VISION_MODEL=qwen-vl-plus

DYNAMODB_USERS_TABLE=BillSplitter-Users
DYNAMODB_RECEIPTS_TABLE=BillSplitter-Receipts
DYNAMODB_SPLIT_SESSIONS_TABLE=BillSplitter-SplitSessions
DYNAMODB_PAYMENT_REQUESTS_TABLE=BillSplitter-PaymentRequests
DYNAMODB_TRANSACTION_HISTORY_TABLE=BillSplitter-TransactionHistory

ENVIRONMENT=development
LOG_LEVEL=INFO
```

**Frontend (`bill-splitter-frontend-react/.env`)**
```bash
VITE_API_BASE_URL=https://fs05jjlase.execute-api.ap-southeast-1.amazonaws.com
VITE_TNG_MERCHANT_ID=your_tng_merchant_id
```

---

## 🎯 Usage

1. **Upload Receipt** — Tap the camera icon or select a file from your device
2. **AI Extraction** — Wait 2-3 seconds for Qwen Vision to parse the receipt
3. **Split Bill** — Type natural language (*"Calvin had nasi lemak, Jet had iced coffee"*) or use manual assignment
4. **Review** — Verify items, amounts, and tax/service distribution
5. **Generate Links** — TNG/DuitNow deep links are auto-created per person
6. **Share Requests** — Use native share sheet, WhatsApp, or clipboard
7. **Track Payments** — Mark people as paid when they settle up

---

## 🏆 Hackathon Highlights

- ✅ **Multi-Cloud Architecture** — Real AWS + Alibaba Cloud integration, not just failover
- ✅ **AI-Powered** — Qwen Vision-Language Model for receipt OCR and NLP parsing
- ✅ **Production-Ready** — Terraform IaC, environment-based configuration, error handling
- ✅ **Mobile-First PWA** — Installable, offline-capable, native share integration
- ✅ **TNG Ecosystem** — Deep links, DuitNow, payment tracking, contact management
- ✅ **Natural Language** — Conversational bill splitting with fuzzy contact matching
- ✅ **Scalable** — Serverless architecture with DynamoDB GSI for efficient queries
- ✅ **Developer Experience** — TypedDict models, centralized config, comprehensive logging

---

## 🔮 Future Roadmap

### **Phase 1: POS Integration (Q2 2026)**
- Direct integration with restaurant POS systems
- Real-time receipt delivery via webhook
- Automatic split initiation upon payment completion

### **Phase 2: Enhanced AI (Q3 2026)**
- Multi-language receipt support (Malay, Chinese, Tamil)
- Handwritten receipt recognition
- Smart item categorization (food, drinks, desserts)

### **Phase 3: Social Features (Q4 2026)**
- Group splitting history
- Recurring split templates
- Split analytics & insights

### **Phase 4: Payment Expansion (2027)**
- GrabPay integration
- Boost eWallet support
- International payment methods

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 👥 Team

Built with ❤️ for the Touch 'n Go Hackathon

**CheckMate** — Because splitting bills shouldn't require a calculator, a therapist, and three WhatsApp groups.

---

## 🙏 Acknowledgments

- **Alibaba Cloud DashScope** — For providing the Qwen AI models
- **AWS** — For serverless infrastructure
- **Touch 'n Go** — For the eWallet ecosystem
- **React & Vite Teams** — For amazing developer tools

---

