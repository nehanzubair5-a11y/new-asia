
# New Asia Dealer Management System (DMS)

## Project Overview
This is a comprehensive Dealer Management System designed for **New Asia** and **Ramza** automotive brands. It manages the entire lifecycle of vehicle sales, including:
- **Dealer Portal:** Dealers can book vehicles, order stock, view their financials, and manage inventory.
- **Admin Dashboard:** Head office staff can approve orders, manage products, track sales, and view reports.
- **RBAC:** Role-Based Access Control for Admin, Super Admin, Finance, Logistics, etc.

## 🛠 Tech Stack (Current Frontend)
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API (No external Redux/Zustand required yet)
- **Charts:** Recharts
- **Icons:** Custom SVG Component System
- **Build Tool:** Vite
- **PWA:** Vite Plugin PWA (Offline capabilities enabled)

## 🏗 Current Architecture
The app now supports **Supabase-backed persistence** with automatic fallback to mock mode:
- If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, `api/index.ts` uses real Supabase tables.
- If env keys are missing, it falls back to in-memory mock data so local dev/tests still run.

## 🚀 Supabase Setup (Required for Real Backend)
1. Create a Supabase project.
2. Open SQL Editor and run: `supabase/schema.sql`.
3. In Supabase, copy:
   - Project URL
   - Anon Public Key
4. Create `.env.local` from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Restart dev server.

## 🔐 Supabase Auth Setup (Completed Integration)
The app now uses Supabase Auth when env keys are configured:
- `LoginPage` signs in with `supabase.auth.signInWithPassword`.
- Dealer registration creates both dealer record and auth account.
- User profile/role is resolved from `public.users`.

### Create first admin account
1. In Supabase Auth, create user (email/password) OR sign up once from app.
2. In SQL Editor, assign admin role in `public.users`:
   ```sql
   update public.users
   set role = 'Admin', name = 'Admin User'
   where email = 'your-admin-email@example.com';
   ```
3. Login with that account in the app.

## 💻 How to Run Locally
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```

## ☁️ Deploy to Vercel
1. Import this repo/project in Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add Vercel environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

## 🔐 Important Security Note
- `supabase/schema.sql` currently creates permissive RLS policies for fast setup.
- Before production launch, replace with strict role-based policies tied to authenticated users.
- Auth now uses Supabase in configured environments, but authorization still depends on profile roles in `public.users`.

## 📂 Key Directory Structure
- `/src/components`: UI Components (Pages, Modals, Shared widgets).
- `/src/context`: Global State (Auth, Data, App settings).
- `/src/hooks`: Custom hooks (Permissions, Pagination).
- `/src/types.ts`: **Source of Truth** for all data models.
- `/src/api/index.ts`: **Mock API Layer** (Replace this with real API integration).
- `/src/permissions.ts`: Granular permission definitions.

## 🎨 UI/UX Notes
- The app supports Dark Mode (system preference or toggle in settings).
- Responsive design is handled via Tailwind classes (mobile-first).
- Printing is handled via a custom `printElementById` utility in `utils/print.ts`.
