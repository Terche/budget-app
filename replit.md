# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains an Expo mobile app (Budget & ROI Tracker) and an Express API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Budget & ROI Tracker (Mobile App)
- **Directory**: `artifacts/budget-app/`
- **Type**: Expo (React Native)
- **Tech**: Expo Router, AsyncStorage, React Query, react-native-svg, expo-linear-gradient

### Features
1. **Dashboard** - Net balance, income/expense summary, savings overview, quick ROI preview
2. **Transactions** - Add/edit/delete income & expenses with categories, groups, notes
3. **Bi-Weekly Savings** - Create savings plans with auto-generated entries every 14 days, timeline view
4. **ROI Calculator** - Multi-scenario business plan analysis with profit/loss, ROI %, break-even calculations
5. **Reports** - Pie chart (expense breakdown), bar chart (income vs expenses), line chart (savings growth), group spending
6. **CSV Export** - Export transactions, savings, and business plans as CSV files via native Share

### Architecture
- `context/AppContext.tsx` - Central state management with AsyncStorage persistence
- `services/roiService.ts` - ROI calculation logic (kept out of UI)
- `services/csvService.ts` - CSV serialization/parsing
- `components/` - Shared UI components
- `app/(tabs)/` - Tab screens: index, transactions, savings, roi, reports
- `app/transaction/` - new, [id] routes
- `app/savings/` - new, [id] routes
- `app/roi/` - new, [id] routes
- `app/settings.tsx` - Export & data management

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
