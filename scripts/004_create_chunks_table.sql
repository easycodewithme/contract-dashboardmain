-- Create chunks table for document text chunks with embeddings
CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id TEXT NOT NULL,
  doc_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text_chunk TEXT NOT NULL,
  embedding vector(384), -- Using 384 dimensions for sentence transformers
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for multi-tenant isolation
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own chunks
CREATE POLICY "chunks_select_own" ON chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chunks_insert_own" ON chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chunks_update_own" ON chunks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chunks_delete_own" ON chunks FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
