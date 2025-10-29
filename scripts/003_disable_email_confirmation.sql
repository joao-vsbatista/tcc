-- Disable email confirmation for development/testing
-- This allows users to sign up without verifying their email
-- Note: In Supabase dashboard, you should also disable "Enable email confirmations" 
-- under Authentication > Settings > Email Auth

-- Update existing users to be confirmed (if any)
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
