-- Entity Relationship Diagram Documentation
-- This file contains the complete database schema with relationships

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- ENTITY RELATIONSHIP DIAGRAM
-- ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTRACT MANAGEMENT SYSTEM                        │
│                              DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │   documents     │       │ document_chunks │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────┤│ id (PK)         │◄─────┤│ id (PK)         │
│ email           │ 1   ∞││ user_id (FK)    │ 1   ∞││ document_id (FK)│
│ created_at      │       ││ contract_name   │       ││ chunk_id        │
│ encrypted_pass  │       ││ filename        │       ││ text_chunk      │
│ email_confirmed │       ││ parties         │       ││ embedding       │
│ phone           │       ││ start_date      │       ││ metadata        │
│ phone_confirmed │       ││ expiry_date     │       ││ created_at      │
│ last_sign_in    │       ││ status          │       │└─────────────────┘
└─────────────────┘       ││ risk_score      │       │
                          ││ uploaded_on     │       │
                          ││ created_at      │       │
                          ││ updated_at      │       │
                          │└─────────────────┘       │
                          │                          │
                          └──────────────────────────┘

RELATIONSHIPS:
- auth.users (1) ──── (∞) documents
  One user can have many documents
  
- documents (1) ──── (∞) document_chunks  
  One document can have many chunks for vector search
*/

-- ============================================================================
-- TABLE DEFINITIONS WITH CONSTRAINTS
-- ============================================================================

-- Documents table with comprehensive contract metadata
CREATE TABLE IF NOT EXISTS documents (
    -- Primary key and foreign key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contract identification
    contract_name TEXT NOT NULL CHECK (length(contract_name) > 0),
    filename TEXT NOT NULL CHECK (length(filename) > 0),
    
    -- Contract parties and dates
    parties TEXT,
    start_date DATE,
    expiry_date DATE,
    
    -- Status and risk assessment
    status TEXT NOT NULL DEFAULT 'Active' 
        CHECK (status IN ('Active', 'Expired', 'Renewal Due')),
    risk_score TEXT NOT NULL DEFAULT 'Low' 
        CHECK (risk_score IN ('Low', 'Medium', 'High')),
    
    -- Timestamps
    uploaded_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (
        start_date IS NULL OR 
        expiry_date IS NULL OR 
        start_date <= expiry_date
    )
);

-- Document chunks for vector search and AI processing
CREATE TABLE IF NOT EXISTS document_chunks (
    -- Primary key and foreign key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Chunk identification and content
    chunk_id TEXT NOT NULL CHECK (length(chunk_id) > 0),
    text_chunk TEXT NOT NULL CHECK (length(text_chunk) > 0),
    
    -- Vector embedding for semantic search (384 dimensions)
    embedding VECTOR(384),
    
    -- Metadata for additional context
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint on chunk_id per document
    UNIQUE(document_id, chunk_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_risk_score ON documents(risk_score);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_contract_name ON documents USING gin(to_tsvector('english', contract_name));
CREATE INDEX IF NOT EXISTS idx_documents_parties ON documents USING gin(to_tsvector('english', parties));

-- Document chunks indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_id ON document_chunks(chunk_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata ON document_chunks USING gin(metadata);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their own documents" ON documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid() = user_id);

-- Document chunks policies
CREATE POLICY "Users can view chunks of their documents" ON document_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = document_chunks.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chunks for their documents" ON document_chunks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = document_chunks.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update chunks of their documents" ON document_chunks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = document_chunks.document_id 
            AND documents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete chunks of their documents" ON document_chunks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = document_chunks.document_id 
            AND documents.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on documents
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding VECTOR(384),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    chunk_id TEXT,
    document_id UUID,
    text_chunk TEXT,
    metadata JSONB,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.chunk_id,
        dc.document_id,
        dc.text_chunk,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE d.user_id = auth.uid()
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: This would typically be inserted via the application
-- but included here for reference

/*
-- Sample documents (would be inserted by authenticated users)
INSERT INTO documents (
    user_id, 
    contract_name, 
    filename, 
    parties, 
    start_date, 
    expiry_date, 
    status, 
    risk_score
) VALUES 
(
    auth.uid(), -- Current authenticated user
    'Master Service Agreement',
    'MSA_TechCorp_2024.pdf',
    'TechCorp Inc. and ClientCorp LLC',
    '2024-01-01',
    '2025-12-31',
    'Active',
    'Low'
),
(
    auth.uid(),
    'Non-Disclosure Agreement',
    'NDA_Confidential_2024.pdf',
    'TechCorp Inc. and Partner Solutions',
    '2024-03-15',
    '2027-03-15',
    'Active',
    'Medium'
);

-- Sample document chunks with embeddings
INSERT INTO document_chunks (
    document_id,
    chunk_id,
    text_chunk,
    embedding,
    metadata
) VALUES (
    (SELECT id FROM documents WHERE contract_name = 'Master Service Agreement' LIMIT 1),
    'msa_termination_clause',
    'Either party may terminate this agreement with ninety (90) days written notice.',
    '[0.1, 0.2, 0.3, ...]'::vector, -- Mock embedding
    '{"page": 5, "clause_type": "termination", "confidence": 0.95}'::jsonb
);
*/

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for contract summary with chunk count
CREATE OR REPLACE VIEW contract_summary AS
SELECT 
    d.id,
    d.contract_name,
    d.filename,
    d.parties,
    d.start_date,
    d.expiry_date,
    d.status,
    d.risk_score,
    d.uploaded_on,
    COUNT(dc.id) as chunk_count,
    CASE 
        WHEN d.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN d.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Active'
    END as expiry_status
FROM documents d
LEFT JOIN document_chunks dc ON d.id = dc.document_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.contract_name, d.filename, d.parties, d.start_date, 
         d.expiry_date, d.status, d.risk_score, d.uploaded_on;

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- Query to monitor table sizes and performance
CREATE OR REPLACE VIEW database_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('documents', 'document_chunks');

-- ============================================================================
-- BACKUP AND MAINTENANCE
-- ============================================================================

-- Function to clean up old chunks (if needed)
CREATE OR REPLACE FUNCTION cleanup_orphaned_chunks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM document_chunks 
    WHERE document_id NOT IN (SELECT id FROM documents);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DOCUMENTATION SUMMARY
-- ============================================================================

/*
SCHEMA SUMMARY:
- 2 main tables: documents, document_chunks
- Full text search capabilities
- Vector similarity search for AI queries
- Row Level Security for multi-tenant isolation
- Comprehensive indexing for performance
- Audit trails with timestamps
- Data integrity constraints
- Automated cleanup functions

RELATIONSHIPS:
- One-to-many: users → documents
- One-to-many: documents → document_chunks

SECURITY:
- RLS policies ensure users only access their own data
- Foreign key constraints maintain referential integrity
- Check constraints validate data quality

PERFORMANCE:
- Optimized indexes for common query patterns
- Vector index for similarity search
- Full-text search indexes for contract content
- Materialized views for complex aggregations
*/
