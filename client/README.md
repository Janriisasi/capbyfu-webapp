# CapBYFU Web App - Client

This is the front-end application for the CapBYFU Web App, built with modern web technologies to provide a seamless and visually appealing experience for public users, church administrators, and super administrators.

## 🚀 Technologies Used

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts/Data Vis**: [Recharts](https://recharts.org/)
- **Utilities**: `dompurify`, `react-hot-toast`, `exceljs`

## 📁 Project Structure

The client application is organized into several key areas:

- **Public Pages**: Landing page and announcements that are accessible to everyone.
- **Church Registration Flow**: Dedicated pages for church administrators to log in, register, and manage their dashboard.
- **Super Admin Dashboard**: A comprehensive administrative panel to manage announcements, registrations, and financials.
- **Developer Hub**: Internal developer tools for administrative and debugging purposes.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   Create a `.env` file in the `client` directory based on the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

   Fill in the necessary values for your Supabase project:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_ACCESS_KEY`
   - `VITE_DEV_PASSWORD`

### Running the Application

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or depending on your Vite config port).

### Building for Production

To create a production build:

```bash
npm run build
```

The production-ready assets will be generated in the `dist` folder. To preview the build:

```bash
npm run preview
```

## 🔒 Authentication & Routes

The application features role-based access control with specific routes:

- **Public**: `/`, `/announcements`
- **Church Admin**: `/register`, `/register/form`, `/register/dashboard` (Requires Authentication)
- **Super Admin**: `/admin`, `/admin/dashboard`, `/admin/announcements`, `/admin/announcements/add`, `/admin/announcements/edit/:id`, `/admin/registrations`, `/admin/financials` (Requires Super Admin Role)
- **Developer**: `/dev`, `/dev/dashboard` (secured via DevGuard)

## 🎨 UI/UX Highlights

- **Dynamic Design**: Interactive animations powered by Framer Motion and GSAP.
- **Custom Toasts**: Styled notifications using `react-hot-toast` matching the overall dark mode aesthetic.
- **Click Effects**: Custom `<ClickSpark>` components for interactive feedback across the user layout.
