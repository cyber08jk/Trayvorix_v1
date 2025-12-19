-- Create access_requests table for user registration requests
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    requested_role TEXT NOT NULL DEFAULT 'operator',
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can insert (for public registration)
CREATE POLICY "Anyone can submit access request"
    ON access_requests FOR INSERT
    WITH CHECK (true);

-- Only admins can view all requests
CREATE POLICY "Admins can view all requests"
    ON access_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Only admins can update requests
CREATE POLICY "Admins can update requests"
    ON access_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS access_requests_status_idx ON access_requests(status);
CREATE INDEX IF NOT EXISTS access_requests_email_idx ON access_requests(email);
CREATE INDEX IF NOT EXISTS access_requests_created_at_idx ON access_requests(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_access_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS access_requests_updated_at ON access_requests;
CREATE TRIGGER access_requests_updated_at
    BEFORE UPDATE ON access_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_access_request_updated_at();
