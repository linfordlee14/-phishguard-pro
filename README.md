# PhishGuard Pro

Phishing simulation and security awareness training platform for South African SMBs.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Flask (Python)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Firebase project with Firestore and Authentication enabled

### 1. Clone & Install

```bash
cd phishguard-pro
npm install
```

### 2. Environment Variables

Create `.env` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Start Frontend

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Start Backend (optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
flask run
```

The API runs at `http://localhost:5000` (proxied by Vite).

### 5. Seed Data

Register a new account through the UI. Seed data (6 templates, 8 employees, 3 campaigns) is automatically created on first registration.

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Badge, Input, Select, Table, Modal, etc.
│   ├── charts/      # LineChart, DonutChart, BarChart (Recharts wrappers)
│   └── layout/      # Sidebar, Navbar, PageWrapper
├── hooks/           # useAuth, useFirestore, useCampaigns, useEmployees
├── pages/           # All route pages
├── services/        # Firebase config, API client
├── types/           # TypeScript interfaces
└── utils/           # Risk score, PDF export, CSV parser

backend/
├── app.py           # Flask API server
└── requirements.txt
```

## Features

- Phishing campaign simulation with SA-branded templates
- Employee management with CSV import
- Dashboard with risk scores and trend charts
- Interactive security training module
- Reports with PDF export
- Billing page with ZAR pricing tiers
- Firebase Authentication with org-scoped data
- Dark mode UI

## License

Private — All rights reserved.
