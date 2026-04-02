<div align="center">
  <img src="public/assets/logo.png" alt="CapBYFU Logo" width="180" />
  <br /><br />

  <h1>CapBYFU Web App</h1>
  <p>The official registration and information platform for the<br /><strong>Capiz Baptist Youth Fellowship Union</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white" />
  </p>
</div>

---

## Overview

CapBYFU Web App is a full-stack registration and information platform built for the Capiz Baptist Youth Fellowship Union annual camp. It serves three distinct user groups — the general public, church administrators, and a super admin — each with their own dedicated experience.

> Built with React + Vite on the frontend and Supabase (PostgreSQL + Auth + Storage) on the backend.

---

## Features

### 🌐 Public
- Landing page with camp countdown, gallery, announcements, and an interactive map of all 58 member churches across Capiz
- Announcements page with category filtering

### ⛪ Church Administrators
- Secure login per church with bcrypt-hashed passwords
- Delegate registration form with image compression (payment proof, consent form)
- Church dashboard to view and manage registered delegates

### 🛡️ Super Admin
- Full dashboard with registration statistics and analytics charts
- Manage announcements (create, edit, delete with live preview)
- Registration management with payment status toggling and Excel export
- Financial reports broken down per church
- Church settings — set registration fees and Google Drive links
- Honeypot-protected login (`/admin?access_key=...`) — shows a fake 404 to unauthorized visitors

### 🔧 Developer Console
- Secret monitoring dashboard at `/dev`
- Real-time charts: registrations over time, payment rates, circuit breakdown, hourly heatmap
- Live activity feed and church-by-church status table

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS |
| Animations | Framer Motion + GSAP |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Charts | Recharts |
| Excel Export | ExcelJS |
| Map | MapLibre GL JS + OpenFreeMap |
| Notifications | react-hot-toast |
| Security | DOMPurify (XSS sanitization) |

---

## Project Structure

```
client/
├── public/
│   ├── assets/          # Images, gallery photos, merch photos
│   └── logo.png
├── src/
│   ├── components/      # Shared UI components (Navbar, Footer, AdminLayout, etc.)
│   ├── context/         # AuthContext (church admin + super admin sessions)
│   ├── lib/
│   │   ├── supabase.js  # Supabase client, uploadFile, compressImage
│   │   └── constants.js # Church list, roles, shirt sizes, payment methods
│   └── pages/
│       ├── admin/       # Super admin pages (dashboard, registrations, financials, etc.)
│       ├── dev/         # Developer console (devLogin, devDashboard, devGuard)
│       ├── landingPage.jsx
│       ├── announcementPage.jsx
│       ├── churchLogin.jsx
│       ├── registrationForm.jsx
│       └── churchAdminDashboard.jsx
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) project with the schema applied

### Installation

```bash
# Clone the repo
git clone https://github.com/Janriisasi/capbyfu-webapp.git
cd capbyfu-webapp/client

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_ACCESS_KEY=your_secret_honeypot_key
VITE_DEV_PASSWORD=your_dev_console_password
```

### Development

```bash
npm run dev
# App runs at http://localhost:5173
```

### Production Build

```bash
npm run build    # outputs to /dist
npm run preview  # preview the production build locally
```

---

## Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/announcements` | Public | Announcements feed |
| `/register` | Public | Church login |
| `/register/form` | Church Admin | Delegate registration form |
| `/register/dashboard` | Church Admin | Church admin dashboard |
| `/admin?access_key=...` | Super Admin | Admin login (honeypot protected) |
| `/admin/dashboard` | Super Admin | Overview + analytics |
| `/admin/announcements` | Super Admin | Manage announcements |
| `/admin/registrations` | Super Admin | Manage delegates |
| `/admin/financials` | Super Admin | Financial reports |
| `/dev` | Developer | Dev console login |
| `/dev/dashboard` | Developer | Monitoring dashboard |

---

## Database Setup

The full schema, seed data, and migrations are in the `/supabase` folder (or `/sql` depending on your structure). Run them in order in the Supabase SQL Editor:

1. `supabase_schema.sql` — creates all tables, RLS policies, and RPC functions
2. `migration_churches.sql` — inserts the official list of 58 churches
3. `update_church_passwords.sql` — sets individual bcrypt passwords per church
4. `migration_merch_fee.sql` — adds the separate `merch_fee` column

### Storage Buckets

Create these buckets in your Supabase dashboard:

| Bucket | Public |
|---|---|
| `payment-proofs` | ❌ Private |
| `consent-forms` | ❌ Private |
| `announcement-images` | ✅ Public |

---

## Security Notes

- Church passwords are bcrypt-hashed using PostgreSQL's `pgcrypto` extension and verified server-side via an RPC function — plain-text passwords are never sent to the client
- The super admin login is protected by a honeypot: visiting `/admin` shows a generic 404. The real login only appears at `/admin?access_key=YOUR_KEY`
- All user input is sanitized with DOMPurify before being stored
- Uploaded images are compressed and converted to WebP before upload (max 800px, adaptive quality based on file size)

---

## Acknowledgements

Built for the **Capiz Baptist Youth Fellowship Union (CapBYFU)** to support their annual camp registration process across 58 member churches in Capiz, Philippines.

<div align="center">
  <br />
  <img src="public/assets/logo.png" alt="CapBYFU" width="60" />
  <br />
  <sub>Made by John Rey Sasi for CapBYFU · Capiz, Philippines</sub>
</div>