# USHUS 2026 — Management Fest Platform

Enterprise-grade event management platform for Christ University's flagship MBA fest. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## 🚀 Features

- **Dual Portals**: Public-facing registration site & internal management dashboard
- **Role-Based Access Control**: Granular permissions (Admin, Organiser, Volunteer, Participant)
- **Real-Time Collaboration**: Live task updates and notifications via Pusher
- **Interactive Gantt Charts**: Drag-and-drop task scheduling and dependency management
- **Automated Workflows**: Email notifications, PDF generation, and approval pipelines

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4 & shadcn/ui
- **Authentication**: NextAuth.js v5
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

## 🔒 Security

- Comprehensive RBAC implemented in middleware and API routes
- Rate limiting on authentication endpoints
- Strict Content Security Policy (CSP) headers
- Audit logging for all sensitive mutations

## 📄 License

Proprietary — Christ University, Bangalore Central Campus.
