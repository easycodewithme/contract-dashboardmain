-- Create documents table for contract metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  contract_name TEXT NOT NULL,
  parties TEXT,
  uploaded_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date DATE,
  status TEXT CHECK (status IN ('Active', 'Renewal Due', 'Expired')) DEFAULT 'Active',
  risk_score TEXT CHECK (risk_score IN ('Low', 'Medium', 'High')) DEFAULT 'Low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for multi-tenant isolation
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can only access their own documents
CREATE POLICY "documents_select_own" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert_own" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update_own" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "documents_delete_own" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_risk_score ON documents(risk_score);
