# Supabase Database Setup

This directory contains SQL migration files for the Trayvorix database schema.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for Hackathon)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - `001_initial_schema.sql` - Creates all tables
   - `002_indexes.sql` - Adds performance indexes
   - `003_functions_triggers.sql` - Adds automated functions and triggers
   - `004_rls_policies.sql` - Configures Row Level Security (run this after Task 1.5)
5. Click **Run** for each migration
6. Verify success by checking the **Table Editor**

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files

### 001_initial_schema.sql
Creates the core database structure:
- Custom ENUM types for status fields
- 15 main tables (warehouses, products, inventory, etc.)
- Foreign key relationships
- Default values and constraints

### 002_indexes.sql
Adds performance indexes on:
- Frequently queried columns
- Foreign keys
- Search fields
- Date/timestamp columns

### 003_functions_triggers.sql
Implements automated functionality:
- Auto-update `updated_at` timestamps
- Audit logging for all changes
- Inventory updates on stock movements
- Low stock notifications
- Expiring batch checks

### 004_rls_policies.sql
Configures Row Level Security:
- Role-based access control
- Admin full access
- Operator read/write on operational tables
- Auditor read-only access
- Vendor limited access

## Verification

After running migrations, verify the setup:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## Troubleshooting

### Error: "extension uuid-ossp does not exist"
- Go to **Database** → **Extensions** in Supabase dashboard
- Enable the `uuid-ossp` extension

### Error: "permission denied"
- Make sure you're running queries as the postgres user
- Check that RLS is not blocking your queries

### Error: "relation already exists"
- The migration has already been run
- Either skip it or drop the existing tables first (⚠️ data loss)

## Next Steps

After running all migrations:
1. Proceed to Task 1.5 to configure RLS policies
2. Test the schema by inserting sample data
3. Verify triggers and functions are working
