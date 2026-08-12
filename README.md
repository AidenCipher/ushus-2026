# USHUS 2026 — Christ University MBA Management Fest Platform

Enterprise-grade event management platform for Christ University's flagship MBA fest. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## 🚀 Features

- **Dual Portals**: Public-facing registration site & internal management dashboard
- **Role-Based Access Control**: Granular permissions (Admin, Organiser, Volunteer, Participant)
- **Real-Time Collaboration**: Live task updates and notifications via Pusher
- **Interactive WBS Gantt Charts**: Complete 12-milestone hierarchical project scheduler with recursive predecessor lags and dynamic date cascading
- **Styled Excel Formula Export**: Visual-matched spreadsheet export featuring active formulas linked to a master Fest Start Date cell (B2), preserving interactive updates in Excel/Google Sheets
- **Strict Registration Check**: Multi-event checks blocking email and phone duplications across teams
- **Roster Management**: Scoped roster assignments and role modifications for organisers

## 🛠 Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS & shadcn/ui
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Real-Time**: Pusher
- **Emails**: Resend
- **State Management**: Zustand
- **Date Handling**: date-fns

## 📦 Getting Started

### 1. Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Pusher account
- Resend account (optional, for emails)

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ushus-2026

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

```bash
# Generate Prisma client and push schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 4. Development

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 5. Default Test Accounts

(Passwords for all test accounts: `Admin@2026`, `Volunteer@2026`, or `Participant@2026`)

- **Admin**: `abhinav@ushus2026.com`
- **Organiser**: `priya.marketing@ushus2026.com`
- **Volunteer**: `sneha.reddy@ushus2026.com`
- **Participant**: `aditya.kumar@student.com`

---

## 📅 Fest Details (USHUS 2026)

- **Fest Dates**: November 4-5, 2026
- **Expected Participation**: 600+
- **Events Matrix (10)**:
  - Best Manager, Best Management Team, B-Quiz, Finance, Marketing, Logistics, Operations & Systems (LOS), HR, Business Analytics (BA), Business Plan, Strategy

## 🔒 Security & Concurrency

- **Role-Based Access Control**: Granular permissions (Admin, Organiser, Volunteer, Participant) via `lib/permissions.ts`.
- **Concurrency Control**: Shared event capacity managed via `SELECT FOR UPDATE` in `Serializable` transactions to prevent overbooking.
- **Rate Limiting**: Integrated connection throttling (10/15m for Register, 5/15m for Login, 20/15m for Event Registration).
- **Security Headers**: Strict Content Security Policy (CSP) with `unsafe-inline` permitted for the Next.js runtime.
- **Audit Logging**: Comprehensive action tracking for all sensitive mutations and verifications (e.g., `VERIFY_PAYMENT`).

## 📄 License

Proprietary — Christ University, Bangalore Central Campus.
