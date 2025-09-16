-- Insert sample contract data for demonstration

-- Note: This script should only be run after user authentication is set up
-- The user_id values below are placeholders and should be replaced with actual user IDs

-- Sample documents (replace user_id with actual authenticated user IDs)
INSERT INTO documents (
    id,
    user_id,
    contract_name,
    filename,
    parties,
    start_date,
    expiry_date,
    status,
    risk_score,
    file_size,
    file_type,
    processed
) VALUES 
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user_id
    'Master Service Agreement',
    'MSA_TechCorp_2024.pdf',
    'TechCorp Inc. and ClientCorp LLC',
    '2024-01-15',
    '2025-01-15',
    'Active',
    'Medium',
    2048576,
    'application/pdf',
    true
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user_id
    'Non-Disclosure Agreement',
    'NDA_Confidential_2024.pdf',
    'TechCorp Inc. and Partner Solutions',
    '2024-03-01',
    '2027-03-01',
    'Active',
    'Low',
    1024768,
    'application/pdf',
    true
),
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user_id
    'Software License Agreement',
    'SLA_Enterprise_2024.pdf',
    'TechCorp Inc. and Enterprise Client',
    '2024-06-01',
    '2024-12-31',
    'Renewal Due',
    'High',
    3145728,
    'application/pdf',
    true
);

-- Note: To use this script properly:
-- 1. First create a user account through the application
-- 2. Get the user_id from the auth.users table
-- 3. Replace the placeholder user_id values above with the actual user_id
-- 4. Then run this script

-- Example query to get user_id after creating an account:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
