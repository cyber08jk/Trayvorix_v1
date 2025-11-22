# Supabase Setup Guide for Trayvorix

## ✅ Your Credentials Are Already Configured!

Your `.env.local` file has:
- Project URL: `https://likixemiukqnzuevjncd.supabase.co`
- Anon Key: Configured ✓

## 🔧 Next Step: Run Database Migrations

You need to create the database tables. Here's how:

### Option 1: Using Supabase Dashboard (Recommended - 5 minutes)

1. **Go to your Supabase project:**
   - Visit: https://supabase.com/dashboard/project/likixemiukqnzuevjncd
   - Login if needed

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 1 - Initial Schema:**
   - Open file: `trayvorix/supabase/migrations/001_initial_schema.sql`
   - Copy ALL the content
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

4. **Run Migration 2 - Indexes:**
   - Open file: `trayvorix/supabase/migrations/002_indexes.sql`
   - Copy ALL the content
   - Paste into a new query
   - Click "Run"

5. **Run Migration 3 - Functions & Triggers:**
   - Open file: `trayvorix/supabase/migrations/003_functions_triggers.sql`
   - Copy ALL the content
   - Paste into a new query
   - Click "Run"

6. **Run Migration 4 - RLS Policies:**
   - Open file: `trayvorix/supabase/migrations/004_rls_policies.sql`
   - Copy ALL the content
   - Paste into a new query
   - Click "Run"

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref likixemiukqnzuevjncd

# Run migrations
supabase db push
```

## 👤 Create Your First User

After running migrations:

1. **Go to Authentication:**
   - Click "Authentication" in left sidebar
   - Click "Users" tab
   - Click "Add User" → "Create new user"

2. **Create Admin User:**
   - Email: `admin@trayvorix.com`
   - Password: `admin123` (or your choice)
   - Click "Create User"

3. **Add Role Metadata:**
   - Click on the user you just created
   - Scroll to "User Metadata" section
   - Click "Edit"
   - Add this JSON:
     ```json
     {
       "role": "admin"
     }
     ```
   - Click "Save"

## 🔄 Restart Your App

After completing the setup:

1. Stop the dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. Go to http://localhost:5174
4. Login with: admin@trayvorix.com / admin123

## ✅ Verify Setup

After login, you should see:
- ✅ Dashboard with KPI cards
- ✅ Navigation sidebar
- ✅ Products page (empty initially)
- ✅ No "Failed to fetch" errors

## 🐛 Troubleshooting

### Still getting "Failed to fetch"?

1. **Check Supabase project is active:**
   - Go to https://supabase.com/dashboard
   - Make sure project status is "Active" (not paused)

2. **Verify migrations ran successfully:**
   - Go to "Table Editor" in Supabase
   - You should see tables: products, warehouses, inventory, etc.

3. **Check browser console:**
   - Press F12 in browser
   - Look at Console tab for specific error messages

4. **Verify environment variables loaded:**
   - Add this to your browser console:
     ```javascript
     console.log(import.meta.env.VITE_SUPABASE_URL)
     ```
   - Should show your Supabase URL

### Need Help?

Common issues:
- **"relation does not exist"** → Migrations not run yet
- **"Failed to fetch"** → Supabase project paused or network issue
- **"Invalid JWT"** → Wrong anon key in .env.local
- **"Row Level Security"** → RLS policies not applied (migration 4)

## 📝 Quick Test Query

To verify your setup, run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: adjustments, audit_logs, batches, categories, files, 
-- inventory, locations, notifications, product_barcodes, products, 
-- stock_movements, tasks, transfer_requests, warehouses
```

## 🎉 Once Setup is Complete

You'll have a fully functional inventory management system with:
- Real-time dashboard
- Product management
- User authentication
- Role-based access control
- Activity tracking
- And much more!

Good luck with your hackathon! 🚀
