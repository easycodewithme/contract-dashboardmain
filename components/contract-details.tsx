"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowLeft, Calendar, Users, AlertTriangle, CheckCircle, Info, FileText, Brain, Shield } from "lucide-react"

interface ContractDetail {
  id: string
  contract_name: string
  parties: string
  start_date: string
  expiry_date: string
  status: "Active" | "Expired" | "Renewal Due"
  risk_score: "Low" | "Medium" | "High"
  filename: string
  uploaded_on: string
}

interface ContractDetailsProps {
  contractId: string
}

export function ContractDetails({ contractId }: ContractDetailsProps) {
  const [contract, setContract] = useState<ContractDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Mock AI insights and clauses data
  const mockInsights = {
    clauses: [
      {
        title: "Termination Clause",
        summary:
          "Either party may terminate this agreement with 90 days written notice. Standard termination provisions with reasonable notice period.",
        confidence: 0.95,
        risk: "Low" as const,
      },
      {
        title: "Liability Limitation",
        summary:
          "Total liability is capped at fees paid in preceding 12 months. This may be insufficient for high-value contracts.",
        confidence: 0.88,
        risk: "Medium" as const,
      },
      {
        title: "Confidentiality",
        summary: "5-year confidentiality period post-termination. Comprehensive protection of sensitive information.",
        confidence: 0.92,
        risk: "Low" as const,
      },
      {
        title: "Payment Terms",
        summary: "Net 30 payment terms with 1.5% monthly late fees. Standard commercial payment structure.",
        confidence: 0.87,
        risk: "Low" as const,
      },
    ],
    insights: [
      {
        risk: "Medium" as const,
        message:
          "Liability cap may be insufficient for contracts with high potential damages. Consider increasing the limitation amount.",
      },
      {
        risk: "Low" as const,
        message: "Termination clause provides adequate notice period and is balanced for both parties.",
      },
      {
        risk: "High" as const,
        message: "No force majeure clause detected. This could create risks during unforeseen circumstances.",
      },
      {
        risk: "Low" as const,
        message: "Confidentiality provisions are comprehensive and provide strong protection.",
      },
    ],
    evidence: [
      {
        source: "Section 8.1 - Termination",
        snippet:
          "Either party may terminate this Agreement at any time upon ninety (90) days prior written notice to the other party.",
        relevance: 0.95,
      },
      {
        source: "Section 12.3 - Limitation of Liability",
        snippet:
          "In no event shall either party's total liability exceed the total amount of fees paid under this Agreement in the twelve (12) months preceding the claim.",
        relevance: 0.88,
      },
      {
        source: "Section 9.2 - Confidential Information",
        snippet:
          "The obligations of confidentiality shall survive termination of this Agreement for a period of five (5) years.",
        relevance: 0.92,
      },
      {
        source: "Section 4.1 - Payment Terms",
        snippet:
          "All invoices shall be paid within thirty (30) days of receipt. Late payments shall incur a service charge of 1.5% per month.",
        relevance: 0.87,
      },
    ],
  }

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.from("documents").select("*").eq("id", contractId).single()

        if (error) {
          throw error
        }

        if (data) {
          setContract(data)
        } else {
          setError("Contract not found")
        }
      } catch (err) {
        console.error("Error fetching contract:", err)
        setError(err instanceof Error ? err.message : "Failed to load contract details")
      } finally {
        setLoading(false)
      }
    }

    fetchContractDetails()
  }, [contractId, supabase])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expired":
        return "destructive"
      case "Renewal Due":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "Low":
        return "outline"
      case "Medium":
        return "secondary"
      case "High":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "Medium":
        return <Info className="h-4 w-4 text-yellow-400" />
      case "High":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-300">Loading contract details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Contract Not Found</h3>
            <p className="text-gray-400">{error || "The requested contract could not be found."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white text-balance">{contract.contract_name}</h1>
            <p className="text-gray-400 mt-1">{contract.parties || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Contract Metadata */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Contract Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                Start Date
              </div>
              <p className="text-white font-medium">{formatDate(contract.start_date)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                Expiry Date
              </div>
              <p className="text-white font-medium">{formatDate(contract.expiry_date)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Users className="h-4 w-4 mr-2" />
                Status
              </div>
              <Badge variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Shield className="h-4 w-4 mr-2" />
                Risk Score
              </div>
              <Badge variant={getRiskBadgeVariant(contract.risk_score)}>{contract.risk_score}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <FileText className="h-4 w-4 mr-2" />
                Uploaded
              </div>
              <p className="text-white font-medium">{formatDate(contract.uploaded_on)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clauses Section */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI-Extracted Clauses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.clauses.map((clause, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-white">{clause.title}</h4>
                    <Badge variant={getRiskBadgeVariant(clause.risk)} className="text-xs">
                      {clause.risk}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Confidence</span>
                    <Progress value={clause.confidence * 100} className="w-16 h-2" />
                    <span className="text-xs text-gray-300">{Math.round(clause.confidence * 100)}%</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{clause.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Risk Analysis & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.insights.map((insight, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start space-x-3">
                  {getRiskIcon(insight.risk)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={getRiskBadgeVariant(insight.risk)} className="text-xs">
                        {insight.risk} Risk
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Evidence Panel */}
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Supporting Evidence
            </CardTitle>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Evidence
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-white">Evidence Details</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {mockInsights.evidence.map((evidence, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-300">{evidence.source}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Relevance</span>
                          <Progress value={evidence.relevance * 100} className="w-16 h-2" />
                          <span className="text-xs text-gray-300">{Math.round(evidence.relevance * 100)}%</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic">"{evidence.snippet}"</p>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockInsights.evidence.slice(0, 2).map((evidence, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-300">{evidence.source}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">Relevance</span>
                    <Progress value={evidence.relevance * 100} className="w-16 h-2" />
                    <span className="text-xs text-gray-300">{Math.round(evidence.relevance * 100)}%</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm italic">"{evidence.snippet}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
