# Trayvorix Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

## Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Project name: `trayvorix` (or your preferred name)
   - Database password: (create a strong password)
   - Region: (choose closest to you)
5. Wait for the project to be created (~2 minutes)

### 2. Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

### 3. Configure Environment Variables
1. Open `.env.local` in the project root
2. Replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### 4. Create Database Schema
The database schema will be created in the next task (Task 1.4).

## Running the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Next Steps
After setting up Supabase credentials, proceed to Task 1.4 to create the database schema.
