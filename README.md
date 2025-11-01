## One-Fourth Finance – Fintech Platform Prototype

### Overview
One-Fourth Finance is a full-stack fintech prototype demonstrating end-to-end flows: onboarding/auth, investment coaching, cross-border microfinance, credit risk scoring, crypto-pensions, P2P insurance, tokenized real estate, fraud monitoring, low-cost insurance, a unified dashboard, and an admin panel. AI and blockchain behavior are simulated with deterministic mock logic and realistic dummy data.

### Tech Stack
- Frontend: React + Vite + Chakra UI + Recharts
- Backend: Node.js + Express + JWT auth
- Data: In-memory mock data (seeded on server start). Can be swapped for MongoDB/Postgres later.

### Monorepo Layout
```
client/   # React app
server/   # Express API server with mock data & simulators
```

### Quick Start
1) Prerequisites: Node 18+

2) Install dependencies
```
npm i
```
This will install root deps. For client/server, run:
```
npm i --prefix server
npm i --prefix client
```

Or just use the root command which works with the workspace structure.

3) Configure environment variables
```
cp server/.env.example server/.env
# Edit JWT_SECRET if desired
```

4) Run both servers with one command
```
npm run dev
```

Or run them separately:
```
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
cd client && npm run dev
```

Server runs on http://localhost:4000
Client runs on http://localhost:5173

### Environment
- `server/.env` controls API config. Change `JWT_SECRET` for demos.
- `client` can target a different API via Vite env: create `client/.env` with `VITE_API_URL=http://localhost:4000` (defaults to localhost:4000 if not set).

### Mobile Device Testing
To test on mobile devices (phones/tablets) on the same network:

1. **Find your computer's local IP address:**
   - **macOS/Linux**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1` or `ipconfig getifaddr en0` (macOS)
   - **Windows**: Run `ipconfig` and look for "IPv4 Address" under your active network adapter
   - Look for an address like `192.168.1.XXX` or `10.0.0.XXX`

2. **Configure the client to use your IP:**
   - Create `client/.env` file with:
     ```
     VITE_API_URL=http://YOUR_IP_ADDRESS:4000
     ```
   - Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `http://192.168.1.100:4000`)
   - Restart the Vite dev server after creating/modifying `.env`

3. **Access from mobile:**
   - Make sure your phone is on the same Wi-Fi network as your computer
   - Open `http://YOUR_IP_ADDRESS:5173` in your phone's browser
   - The app will now connect to the backend using the configured IP address

**Note**: The server now listens on all network interfaces (0.0.0.0) by default, making it accessible from mobile devices on your local network.

### Demo Users
- admin@off.demo / Admin123!
- investor@off.demo / Investor123!
- borrower@off.demo / Borrower123!

### Features Implemented (Mocked)
- Auth: signup, login, roles, KYC submission (mock verify)
- Coaching: risk questionnaire -> allocation recommendation
- Microfinance: borrower application, lender funding simulation, schedule gen
- Credit Risk: score, eligibility, PD% (rules-driven)
- Crypto-Pension: balances, compounding simulation, wallet mock
- P2P Insurance: communities, claims, notifications (mock)
- Real Estate: tokenized shares, ROI, ownership simulation
- Fraud: rules-based alerts and audit logs
- Low-Cost Insurance: catalog, quotes, purchase simulation
- Unified Dashboard: consolidated portfolio & alerts
- Admin: manage users, assets, policies, and metrics

### AI & Blockchain Mock Logic
- Location: `server/src/utils/simulators.js`
  - Risk → Allocation: `mapRiskToAllocation(score)` maps 0–100 risk into allocation weights.
  - Portfolio Growth: `simulatePortfolioGrowth(startValue, months, allocation)` uses fixed monthly returns per asset.
  - Credit Risk: `simulateCreditRisk({ income, debts, assets, expenses })` outputs score (300–850), PD%, eligibility.
  - Loan Approval: `simulateLoanApproval({ amount, income, creditScore })` returns approval probability.
  - Repayment Schedule: `simulateRepaymentSchedule(amount, rate, termMonths)` amortization schedule.
  - Compounding: `simulateCompounding(balance, monthlyContribution, months, apy)` for pensions.
  - Fraud Alerts: `simulateFraudAlerts(transactions)` simple rules for alert generation.

No real AI/chain calls are used. Deterministic rules and math create predictable demo behavior.

### Sample Data & Seeding
- Location: `server/src/data/mockDb.js`
  - Users: admin, investor, borrower
  - Insurance Products: a small catalog
  - Properties: tokenized real estate assets
  - Crypto Wallet & Pension: for investor user
  - Loans: one borrower loan for demo
  - P2P Insurance: seeded community `OFF Community Care`

Data is in-memory and recreated on each server start. Replace `mockDb.js` with a DB adapter to persist.

### P2P Insurance Communities & Notifications
- Endpoints under `/insurance`:
  - `GET /communities` – list communities
  - `POST /communities` – create community
  - `POST /communities/join` – join a community
  - `POST /communities/contribute` – contribute funds
  - `GET /notifications` – fetch latest user notifications
- Notifications also emitted on claim decisions.

### Notes
- All AI/ML and blockchain is simulated via `server/src/utils/simulators.js`.
- Data resets on server restart. Replace `mockDb.js` with a real DB adapter to persist.
- Ensure HTTPS/production hardening before real use.

### Scripts
- Server
  - `npm run dev` – nodemon dev server on :4000
  - `npm start` – production server
- Client
  - `npm run dev` – Vite dev server on :5173
  - `npm run build` – production build
  - `npm run preview` – preview build

### License
MIT (prototype only; not for production use without proper review).


