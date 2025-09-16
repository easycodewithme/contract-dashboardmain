# SaaS Contract Management Dashboard

A modern, AI-powered contract management platform built with Next.js, Supabase, and advanced document processing capabilities.

## 🚀 Features

### Core Functionality
- **Smart Document Upload**: Drag-and-drop interface supporting PDF, DOCX, and TXT files
- **AI-Powered Analysis**: Automatic extraction of key contract clauses and risk assessment
- **Natural Language Queries**: Ask questions about your contracts in plain English
- **Advanced Search & Filtering**: Find contracts by name, parties, status, or risk level
- **Real-time Dashboard**: Monitor contract portfolio with status tracking and expiration alerts

### AI & Analytics
- **Clause Extraction**: Automatically identify termination, liability, confidentiality, and payment clauses
- **Risk Scoring**: AI-driven risk assessment with actionable insights
- **Vector Search**: Semantic search across contract content using embeddings
- **Evidence Tracking**: View supporting evidence for AI-generated insights with relevance scores

### Security & Authentication
- **Supabase Authentication**: Secure user management with email/password
- **Row Level Security**: Multi-tenant data isolation
- **Protected Routes**: Authentication guards on all sensitive pages

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI/ML**: Vector embeddings for semantic search (mock implementation)
- **File Processing**: Mock LlamaCloud integration for document parsing

### Database Schema

\`\`\`sql
-- Users table (managed by Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  parties TEXT,
  start_date DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('Active', 'Expired', 'Renewal Due')) DEFAULT 'Active',
  risk_score TEXT CHECK (risk_score IN ('Low', 'Medium', 'High')) DEFAULT 'Low',
  uploaded_on TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks for vector search
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_id TEXT NOT NULL,
  text_chunk TEXT NOT NULL,
  embedding VECTOR(384), -- 384-dimensional embeddings
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_risk_score ON documents(risk_score);
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);
\`\`\`

### Entity Relationship Diagram

\`\`\`
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │   documents     │       │ document_chunks │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄─────┤│ id (PK)         │◄─────┤│ id (PK)         │
│ email           │      ││ user_id (FK)    │      ││ document_id (FK)│
│ created_at      │      ││ contract_name   │      ││ chunk_id        │
└─────────────────┘      ││ filename        │      ││ text_chunk      │
                         ││ parties         │      ││ embedding       │
                         ││ start_date      │      ││ metadata        │
                         ││ expiry_date     │      ││ created_at      │
                         ││ status          │      │└─────────────────┘
                         ││ risk_score      │      │
                         ││ uploaded_on     │      │
                         ││ created_at      │      │
                         ││ updated_at      │      │
                         │└─────────────────┘      │
                         │                         │
                         └─────────────────────────┘
\`\`\`

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Environment variables configured

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd contract-dashboard
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations from `scripts/01_create_tables.sql`
   - Configure authentication settings

4. **Environment Variables**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 📱 User Guide

### Getting Started
1. **Sign Up**: Create an account using email and password
2. **Upload Contracts**: Use the upload page or dashboard button to add documents
3. **View Dashboard**: Monitor all contracts with search and filtering
4. **Query Contracts**: Use natural language to ask questions about your contracts
5. **Analyze Details**: Click on any contract to view AI insights and risk analysis

### Key Features

#### Document Upload
- Supports PDF, DOCX, and TXT files up to 10MB
- Drag-and-drop interface with progress tracking
- Automatic AI processing and clause extraction

#### Dashboard
- **Search**: Find contracts by name, parties, or filename
- **Filters**: Filter by status (Active/Expired/Renewal Due) and risk level
- **Pagination**: Navigate through large contract collections
- **Quick Actions**: View contract details with one click

#### Natural Language Queries
- Ask questions like "What are the termination clauses?"
- Get AI-powered answers with supporting evidence
- View relevance scores for source material
- Example queries provided for guidance

#### Contract Details
- **Overview**: Key dates, parties, status, and risk assessment
- **AI Clauses**: Extracted clauses with confidence scores
- **Risk Analysis**: AI-generated insights and recommendations
- **Evidence**: Supporting text excerpts with relevance ratings

## 🔧 Development

### Project Structure
\`\`\`
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── contract/[id]/     # Dynamic contract detail pages
│   ├── dashboard/         # Main dashboard
│   ├── query/             # Natural language query interface
│   └── upload/            # File upload page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions and configurations
│   └── supabase/         # Supabase client setup
├── scripts/              # Database migration scripts
└── public/               # Static assets
\`\`\`

### Key Components
- **DashboardLayout**: Main layout with sidebar navigation
- **ContractsTable**: Data table with search, filtering, and pagination
- **ContractDetails**: Detailed contract view with AI insights
- **FileUpload**: Drag-and-drop upload interface

### API Integration
The application uses mock implementations for AI services:
- **Document Parsing**: Simulates LlamaCloud document processing
- **Vector Search**: Mock semantic search with relevance scoring
- **AI Insights**: Generated risk analysis and recommendations

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Configuration
- Enable Row Level Security (RLS) policies
- Configure authentication providers
- Set up database indexes for performance

## 🔒 Security

### Authentication
- Supabase Auth with email/password
- Protected routes with authentication guards
- Session management and token refresh

### Data Security
- Row Level Security (RLS) for multi-tenant isolation
- Input validation and sanitization
- Secure file upload with type and size restrictions

## 📊 Performance

### Optimizations
- Next.js App Router for optimal loading
- Database indexes for fast queries
- Lazy loading and code splitting
- Responsive design for all devices

### Monitoring
- Real-time error tracking
- Performance metrics
- User analytics with Vercel Analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
