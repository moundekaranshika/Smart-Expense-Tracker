# 📊 Smart Expense Tracker (Full-Stack Portfolio Project)

A complete, production-ready, full-stack financial management dashboard built with **React**, **Vite**, **Tailwind CSS**, and **Express**. It features a modern bento-grid dashboard, real-time analytics graphs, category budget telemetry with active threshold indicators, secure password-reset question flows, multi-parameter search & filters, and one-click PDF/CSV statement exports.

To optimize the developer experience, the system implements a **dual-storage engine**:
- **Production Mode**: Connects seamlessly to a remote **MongoDB Atlas** cluster via Mongoose schemas.
- **Preview / Developer Mode**: Automatically boots using a lightweight, persistent, file-based database if no connection string is supplied. This ensures the application runs flawlessly **out-of-the-box** with zero setup!

---

## 📁 1. Project Structure

This project follows the strict industry-standard **Model-View-Controller (MVC)** design pattern on the backend and modular, layout-separated structure on the frontend.

```text
├── data/                          # Persistent JSON database (Local Fallback)
│   └── db.json                    # Local storage mock database
├── server/                        # Node/Express MVC Backend
│   ├── config/
│   │   └── db.ts                  # Database router (MongoDB Atlas vs. Local Fallback)
│   ├── controllers/
│   │   ├── authController.ts      # Authentication (Register, Login, Password Reset)
│   │   ├── transactionController.ts # Transactions CRUD & Recharts statistics engine
│   │   └── budgetController.ts    # Budget threshold meters & monthly limits
│   ├── middleware/
│   │   └── auth.ts                # Bearer JWT Verification middleware
│   ├── models/
│   │   ├── User.ts                # User Mongoose schemas and Local models
│   │   ├── Transaction.ts         # Transactions schema and Local models
│   │   └── Budget.ts              # Budget threshold schema and Local models
│   └── routes/
│       ├── authRoutes.ts          # Auth routing endpoints
│       ├── transactionRoutes.ts   # Expense routing endpoints
│       └── budgetRoutes.ts        # Budget limits routing endpoints
├── src/                           # React / Vite Client Frontend
│   ├── components/
│   │   ├── AuthPages.tsx          # Login, Register, & Security Challenges views
│   │   ├── Dashboard.tsx          # Bento metrics, Cash flow trends, Breakdown charts
│   │   ├── TransactionList.tsx    # Scrollable ledger with Search, Filters, Sorters
│   │   ├── TransactionModal.tsx   # Floating form for record addition & edit states
│   │   ├── BudgetManager.tsx      # Target indicators, warning bars, progress metrics
│   │   ├── ProfileSettings.tsx    # Diagnostic logs & credential updates
│   │   ├── Sidebar.tsx            # Pinned collapsible desktop / sliding mobile nav
│   │   └── Toast.tsx              # Portal toast alert notifier context (AnimatePresence)
│   ├── App.tsx                    # Master React context, Axios interceptor, state sync
│   ├── index.css                  # Google Fonts imports, Tailwind variables, Print rules
│   ├── main.tsx                   # Client entry point
│   └── types.ts                   # Unified type definitions (ITransaction, IUser, etc.)
├── .env.example                   # System environment parameters
├── index.html                     # SPA container anchor
├── metadata.json                  # Workspace permissions and descriptors
├── server.ts                      # Main entry bootstrapper (Express + Vite)
├── tsconfig.json                  # Compiler guidelines
└── vite.config.ts                 # Dev asset compiler mapping
```

---

## 🗄️ 2. MongoDB / Mongoose Schemas

### A. User Schema (`server/models/User.ts`)
Tracks client identification and recovery parameters. Passwords and security answers are fully hashed on entry using `bcrypt`.
```typescript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### B. Transaction Schema (`server/models/Transaction.ts`)
Tracks personal cash flows.
```typescript
const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // Food, Shopping, Bills, etc.
  description: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  paymentMode: { type: String, required: true }, // Cash, Card, UPI, etc.
  type: { type: String, enum: ['income', 'expense'], required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### C. Budget Schema (`server/models/Budget.ts`)
Locks category limits per user and calendar month.
```typescript
const BudgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true }, // "All" (Overall) or specific category
  limit: { type: Number, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  createdAt: { type: Date, default: Date.now }
});
```

---

## 📡 3. REST API Documentation

All routes except login/registration require a Bearer token inside the HTTP `Authorization` header:
`Authorization: Bearer <JWT_TOKEN>`

### 🔑 Authentication Module (`/api/auth`)

| Endpoint | Method | Payload | Description |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | `{ name, email, password, securityQuestion, securityAnswer }` | Creates a new account. |
| `/login` | `POST` | `{ email, password }` | Authenticates user and returns a signed JWT. |
| `/forgot-password-question` | `POST` | `{ email }` | Returns the security question configured by the user. |
| `/reset-password` | `POST` | `{ email, securityAnswer, newPassword }` | Resets password after verifying the question answer. |
| `/change-password` | `PUT` | `{ currentPassword, newPassword }` | Updates the active user's password (Authenticated). |

### 📊 Transaction Ledger (`/api/transactions`)

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | `page`, `limit`, `sortBy`, `search`, `type`, `category`, `timeframe`, `startDate`, `endDate` | Returns filtered, searched, and sorted transactions. |
| `/stats` | `GET` | None | Compiles aggregates, Recharts-ready trends, and category ratios. |
| `/` | `POST` | `{ amount, category, description, date, paymentMode, type }` | Records a new cash flow. Computes instant budget checks. |
| `/:id` | `PUT` | `{ amount, category, description, date, paymentMode, type }` | Updates a transaction. |
| `/:id` | `DELETE` | None | Deletes a transaction. |
| `/export/csv` | `GET` | None | Downloads transaction history as an RFC-compliant CSV statement. |

### 🎯 Budget Module (`/api/budgets`)

| Endpoint | Method | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | `month` (e.g., `2026-07`) | Computes target limits vs actual expense outlays. |
| `/` | `POST` | `{ category, limit, month }` | Upserts a monthly category/overall spending limit. |
| `/:id` | `DELETE` | None | Removes a budget spending limit. |

---

## 🚀 4. Deployment Guide

### Frontend Deployment (Vercel)
Vercel is optimal for hosting static client builds.
1. Install Vercel CLI or link your repository to the [Vercel Dashboard](https://vercel.com).
2. Set the build parameters:
   - **Framework Preset**: `Vite`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
3. Configure the **Environment Variables**:
   - `VITE_API_URL`: Your deployed backend URL on Render (e.g. `https://smart-expense-backend.onrender.com`).

### Backend Deployment (Render)
Render is perfect for hosting full-stack Express Node.js servers.
1. Create a **Web Service** on Render and connect your GitHub repository.
2. Configure environment settings:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
3. Define Render **Environment Variables**:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: A high-entropy secret string (e.g., `42b1090f47e307c89bd...`).
   - `MONGODB_URI`: Your MongoDB Atlas collection connection string.
   - `PORT`: `3000` (automatically managed by Render).

---

## 🔮 5. Future Improvements

1. **AI-Powered OCR Receipts Scanner**: Leverage the Google Gemini API to parse scanned image receipts and automatically categorize fields on upload.
2. **Plaid Banking API Sync**: Integrate Plaid to support automatic daily transaction synchronization from live bank accounts.
3. **SMS Transaction Monitors**: Hook up a Twilio webhook route to parse bank alerts sent via text messages.
4. **Push Notification Webhooks**: Implement Service Worker background notifications to alert users instantly the second a card swipe is registered and a budget is nearing 90%.
