# Peso Tracker

A production-ready personal finance mobile app built with **Expo (React Native)**, designed for Filipino users managing budgets, loans, savings, and expenses in Philippine Peso (₱).

---

## Features

### Dashboard
- Net balance overview with income/expense breakdown
- Quick summary cards: accounts balance, monthly bills, and loans
- Recent transactions list with date range filter (7D / 30D / 3M / All)

### Transactions
- Add, edit, and delete income and expense entries
- Categorize by type (Food, Transport, Bills, Health, Shopping, Entertainment, Savings, Salary, Freelance, and more)
- **Multi-select category filter** — tap one or more category chips to narrow the list
- **Date range presets** — All Time, Today, This Week, This Month, Last 3 Months, This Year
- Live totals bar that responds to all active filters
- "Clear N filters" shortcut when filters are active

### Bi-Weekly Savings
- Create savings plans with a target amount and contribution frequency
- Auto-generates entries every 14 days
- Timeline view of past and upcoming contributions

### Debts & Loans
- Track personal, home, car, business, and other loans
- Per-loan metrics: remaining balance, % paid off, monthly payment, interest per month, estimated payoff date
- Record individual payments — each payment automatically reduces the remaining balance
- Delete payments to restore balance (full audit trail)
- Summary card: total debt, total paid across all loans, total monthly obligations, and overall payoff progress

### Reports
- **Expense breakdown** — pie chart with themed colors by category
- **Income vs Expenses** — grouped bar chart by month
- **Savings growth** — cumulative net income line chart built from real transaction data
- **Group spending** — bar chart breakdown by expense group
- Date range filter (3M / 6M / 1Y / All) across all charts
- Fully responsive — charts scale to any screen width

### CSV Export
- Export transactions, savings plans, and loan data as CSV files
- Share via native device share sheet (Files, email, Drive, etc.)

### Settings
- Light / Dark / System theme toggle
- Data management: clear individual data types or full reset

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (React Native) |
| Navigation | Expo Router (file-based) |
| State | React Context + AsyncStorage (persisted) |
| Charts | react-native-svg + custom chart components |
| Gradients | expo-linear-gradient |
| Styling | StyleSheet (themed via `useColors` hook) |
| Language | TypeScript (strict) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
artifacts/budget-app/
├── app/
│   ├── (tabs)/          # Tab screens: Dashboard, Transactions, Accounts, Loans, Reports
│   ├── transaction/     # new.tsx + [id].tsx — add/edit transactions
│   ├── savings/         # new.tsx + [id].tsx — add/edit savings plans
│   ├── roi/             # new.tsx + [id].tsx — add/view loans
│   └── settings.tsx     # Theme toggle + CSV export + data management
├── components/          # Shared UI: FormField, PrimaryButton, EmptyState, etc.
├── context/
│   └── AppContext.tsx   # Central state (transactions, savings, loans) + AsyncStorage
├── hooks/
│   └── useColors.ts     # Theme-aware color palette
├── services/
│   ├── roiService.ts    # Loan calculation logic (payoff months, interest, ROI)
│   └── csvService.ts    # CSV serialization/parsing
└── app.json             # Expo config (Android: com.pesotracker.app)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Expo Go app on your device, or an Android/iOS simulator

### Install & Run

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/peso-tracker.git
cd peso-tracker

# Install dependencies
pnpm install

# Start the Expo dev server
pnpm --filter @workspace/budget-app run dev
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to open on your device.

---

## Currency & Locale

All amounts are displayed in **Philippine Peso (₱)** using the `en-PH` locale. Date formatting follows Philippine conventions.

---

## Data Storage

All data is stored locally on the device using **AsyncStorage**. Nothing is sent to a server. The storage key is `budget_app_data_v2`.

---

## License

MIT
