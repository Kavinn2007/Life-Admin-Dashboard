# Life Admin Dashboard – AI-Powered Personal Management Hub

A production-ready, enterprise-grade, AI-powered Personal Management Platform to organize every aspect of your life.

## 🚀 Features

- **Premium UI**: Ultra-modern interface with glassmorphism, smooth animations, and dark mode.
- **Bill Management**: Track payments, providers, and overdue bills.
- **Insurance Vault**: Manage policies, premiums, and renewal alerts.
- **Secure Document Vault**: Digital locker with expiry tracking and file organization.
- **Subscription Tracker**: Cost analysis and subscription optimization.
- **Smart Reminders**: Calendar-integrated alerts for life events.
- **Asset Portfolio**: Track net worth growth and asset distribution.
- **Emergency Hub**: Quick access to health data and SOS contacts.
- **Goals & Life Planning**: Milestone tracking for travel, savings, and health.
- **AI Assistant**: Smart insights and proactive lifestyle recommendations.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL (Prisma ready).
- **Authentication**: JWT.

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or any DB supported by Prisma)

### Setup & Installation

1. **Clone the repository**
2. **Install Dependencies**
   ```bash
   # Client
   cd client
   npm install

   # Server
   cd server
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory with:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/life_admin?schema=public"
   JWT_SECRET="your_secret"
   GEMINI_API_KEY="your_api_key"
   ```

4. **Launch Application**
   ```bash
   # Terminal 1 (Client)
   cd client
   npm run dev

   # Terminal 2 (Server)
   cd server
   npm run dev
   ```

## 🎨 Design System
- **Primary**: #2563EB (Blue)
- **Accent**: #14B8A6 (Teal), #F59E0B (Amber), #EF4444 (Red)
- **Surface**: Glassmorphism with Backdrop Blur
- **Typography**: Inter & Outfit
