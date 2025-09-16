"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MessageSquare, FileText, Lightbulb, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface QueryResult {
  answer: string
  chunks: {
    chunk_id: string
    text_chunk: string
    metadata: {
      page: number
      contract_name: string
      clause_type?: string
    }
    relevance_score: number
  }[]
}

export default function QueryPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Mock vector search and AI response
  const mockVectorSearch = async (queryText: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock relevant chunks based on query
    const mockChunks = [
      {
        chunk_id: "c1",
        text_chunk:
          "Termination clause: Either party may terminate this agreement with 90 days written notice to the other party.",
        metadata: { page: 2, contract_name: "MSA.pdf", clause_type: "termination" },
        relevance_score: 0.95,
      },
      {
        chunk_id: "c2",
        text_chunk:
          "Liability limitation: Total liability under this agreement shall not exceed the total fees paid in the preceding 12 months.",
        metadata: { page: 5, contract_name: "MSA.pdf", clause_type: "liability" },
        relevance_score: 0.87,
      },
      {
        chunk_id: "c3",
        text_chunk:
          "Confidentiality obligations: All confidential information shall be protected for a period of 5 years after termination.",
        metadata: { page: 3, contract_name: "NDA.pdf", clause_type: "confidentiality" },
        relevance_score: 0.82,
      },
    ]

    // Generate mock AI answer based on query
    let mockAnswer = ""
    const lowerQuery = queryText.toLowerCase()

    if (lowerQuery.includes("termination") || lowerQuery.includes("terminate")) {
      mockAnswer =
        "Based on your contracts, termination clauses typically require 90 days written notice. The MSA.pdf specifically states that either party may terminate the agreement with 90 days written notice to the other party."
    } else if (lowerQuery.includes("liability") || lowerQuery.includes("liable")) {
      mockAnswer =
        "Your contracts include liability limitations. The MSA.pdf caps total liability at the total fees paid in the preceding 12 months, which is a common protective measure."
    } else if (lowerQuery.includes("confidential") || lowerQuery.includes("nda")) {
      mockAnswer =
        "Confidentiality obligations in your contracts extend beyond termination. The NDA.pdf requires protection of confidential information for 5 years after termination."
    } else if (lowerQuery.includes("risk") || lowerQuery.includes("risks")) {
      mockAnswer =
        "Based on analysis of your contracts, key risks include: 1) Termination clauses with short notice periods, 2) Liability caps that may be insufficient, 3) Confidentiality periods that may conflict between agreements."
    } else {
      mockAnswer = `Based on your query about "${queryText}", I found relevant information in your contracts. The most relevant clauses are shown below with their context and relevance scores.`
    }

    return {
      answer: mockAnswer,
      chunks: mockChunks.slice(0, 3), // Return top 3 most relevant
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // In a real implementation, this would:
      // 1. Embed the query using the same model as documents
      // 2. Perform vector similarity search in pgvector
      // 3. Send relevant chunks to LLM for answer generation

      const mockResult = await mockVectorSearch(query)
      setResult(mockResult)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process query")
    } finally {
      setIsLoading(false)
    }
  }

  const exampleQueries = [
    "What are the termination clauses in my contracts?",
    "How long do confidentiality obligations last?",
    "What liability limitations do I have?",
    "Which contracts are expiring soon?",
    "What are the key risks in my agreements?",
  ]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white text-balance">Query Your Contracts</h1>
          <p className="text-gray-400 mt-2">Ask questions about your contracts in natural language</p>
        </div>

        {/* Query Input */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Ask a Question
            </CardTitle>
            <CardDescription className="text-gray-300">
              Type your question in plain English and get AI-powered answers from your contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuery} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="e.g., What are the termination clauses in my contracts?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-lg py-3"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing contracts...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Contracts
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Example Queries */}
        {!result && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Example Questions
              </CardTitle>
              <CardDescription className="text-gray-300">
                Try these sample queries to see what you can ask
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="justify-start text-left h-auto p-4 text-gray-300 hover:text-white hover:bg-white/5 border border-white/10"
                    onClick={() => setQuery(example)}
                  >
                    <ArrowRight className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>{example}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* AI Answer */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  AI Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 leading-relaxed">{result.answer}</p>
              </CardContent>
            </Card>

            {/* Relevant Chunks */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Supporting Evidence
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Relevant excerpts from your contracts that support this answer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.chunks.map((chunk, index) => (
                    <div key={chunk.chunk_id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-purple-300 border-purple-300/30">
                            {chunk.metadata.contract_name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Page {chunk.metadata.page}
                          </Badge>
                          {chunk.metadata.clause_type && (
                            <Badge variant="outline" className="text-xs">
                              {chunk.metadata.clause_type}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-400">Relevance:</span>
                          <Badge
                            variant={
                              chunk.relevance_score > 0.9
                                ? "default"
                                : chunk.relevance_score > 0.8
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {Math.round(chunk.relevance_score * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{chunk.text_chunk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Query Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setQuery("")
                  setResult(null)
                  setError(null)
                }}
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Ask Another Question
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
