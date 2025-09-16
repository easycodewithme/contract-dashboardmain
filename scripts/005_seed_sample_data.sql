-- Insert sample user (password is 'password123' hashed)
INSERT INTO users (id, email, password_hash) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Txjyvq')
ON CONFLICT (email) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (id, user_id, filename, contract_name, parties, expiry_date, status, risk_score) VALUES 
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'MSA.pdf', 'Master Service Agreement', 'Acme Corp, Beta LLC', '2024-12-31', 'Active', 'Low'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'NDA.pdf', 'Non-Disclosure Agreement', 'Acme Corp, Gamma Inc', '2024-06-30', 'Renewal Due', 'Medium'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'SLA.pdf', 'Service Level Agreement', 'Acme Corp, Delta Co', '2024-03-15', 'Expired', 'High')
ON CONFLICT (id) DO NOTHING;

-- Insert sample chunks with mock embeddings
INSERT INTO chunks (chunk_id, doc_id, user_id, text_chunk, embedding, metadata) VALUES 
('c1', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 
 'Termination clause: Either party may terminate this agreement with 90 days written notice.', 
 '[0.12, -0.45, 0.91, 0.33]'::vector, 
 '{"page": 2, "contract_name": "MSA.pdf", "clause_type": "termination"}'),
('c2', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 
 'Liability limitation: Total liability under this agreement shall not exceed the total fees paid in the preceding 12 months.', 
 '[0.01, 0.22, -0.87, 0.44]'::vector, 
 '{"page": 5, "contract_name": "MSA.pdf", "clause_type": "liability"}'),
('c3', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 
 'Confidentiality period: The obligations of confidentiality shall survive termination for a period of 5 years.', 
 '[0.33, 0.67, -0.12, 0.89]'::vector, 
 '{"page": 1, "contract_name": "NDA.pdf", "clause_type": "confidentiality"}')
ON CONFLICT (chunk_id) DO NOTHING;
