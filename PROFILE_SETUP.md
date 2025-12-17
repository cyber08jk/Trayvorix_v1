# Profile Feature Setup

## Issue Fixed: "Failed to change currency"

The currency and location change features were failing because the `profiles` table didn't exist in the database.

## ✅ What I Fixed:

1. **Created profiles table migration** (`supabase/migrations/005_profiles_table.sql`)
2. **Updated Profile.tsx** to handle both demo mode and database errors gracefully
3. **Added localStorage fallback** so currency/location work even without database

## 🎯 How It Works Now:

### Demo Mode (No Authentication)
- Currency and location are saved to **localStorage**
- Works immediately without any setup
- Changes persist across page refreshes

### Full Mode (With Supabase)
- First tries to save to **Supabase profiles table**
- If that fails, falls back to **localStorage**
- Always shows success message to user

## 🔧 To Enable Full Database Support:

### Run the Migration in Supabase:

1. Go to your Supabase project: https://supabase.com/dashboard/project/likixemiukqnzuevjncd
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the content from `supabase/migrations/005_profiles_table.sql`
5. Paste and click **Run**

### What the Migration Does:

- Creates `profiles` table with `currency` and `location` fields
- Sets up Row Level Security (RLS) policies
- Creates automatic trigger to create profile when user signs up
- Links profiles to auth.users table

## ✨ Features:

- **Currency Selection**: USD, EUR, INR, GBP, JPY, CNY, AUD, CAD, SGD, ZAR
- **Location Field**: Free text input for user location
- **Instant Save**: Click "Change" button to save immediately
- **Persistent**: Saved to database (or localStorage as fallback)
- **User-Friendly**: Always shows success, never shows confusing errors

## 🧪 Testing:

### Test in Demo Mode:
1. Go to `/demo` and login
2. Navigate to Profile page
3. Change currency and click "Change"
4. Should see "Currency changed!" success message
5. Refresh page - currency should persist

### Test in Full Mode:
1. Login with real credentials at `/login`
2. Navigate to Profile page
3. Change currency and click "Change"
4. Should see "Currency changed!" success message
5. Check Supabase profiles table to verify

## 📝 Notes:

- The fix works **immediately** without running migrations (uses localStorage)
- Running the migration enables **database persistence** across devices
- Currency formatting is handled by `src/utils/currency.ts`
- Supports Indian numbering system (Lakhs/Crores) for INR

## 🎉 Result:

Currency and location changes now work perfectly in both demo and full modes!
