"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, CheckCircle, FileText, Calendar } from "lucide-react"

interface InsightData {
  id: string
  title: string
  summary: string
  insight_type: string
  risk_level: "Low" | "Medium" | "High"
  confidence: number
  contract_name: string
  created_at: string
}

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<InsightData[]>([])
  const [stats, setStats] = useState({
    totalContracts: 0,
    highRiskContracts: 0,
    expiringContracts: 0,
    avgRiskScore: 0,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)
        await loadInsights(user.id)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const loadInsights = async (userId: string) => {
    try {
      // Load insights with contract names
      const { data: insightsData, error: insightsError } = await supabase
        .from("contract_insights")
        .select(`
          *,
          documents!inner(contract_name, user_id)
        `)
        .eq("documents.user_id", userId)
        .order("created_at", { ascending: false })

      if (insightsError) throw insightsError

      const formattedInsights =
        insightsData?.map((insight) => ({
          ...insight,
          contract_name: insight.documents.contract_name,
        })) || []

      setInsights(formattedInsights)

      // Load contract statistics
      const { data: contractsData, error: contractsError } = await supabase
        .from("documents")
        .select("risk_score, expiry_date")
        .eq("user_id", userId)

      if (contractsError) throw contractsError

      const totalContracts = contractsData?.length || 0
      const highRiskContracts = contractsData?.filter((c) => c.risk_score === "High").length || 0
      const expiringContracts =
        contractsData?.filter((c) => {
          const expiryDate = new Date(c.expiry_date)
          const threeMonthsFromNow = new Date()
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)
          return expiryDate <= threeMonthsFromNow
        }).length || 0

      const riskScores =
        contractsData?.map((c) => {
          switch (c.risk_score) {
            case "High":
              return 3
            case "Medium":
              return 2
            case "Low":
              return 1
            default:
              return 1
          }
        }) || []
      const avgRiskScore = riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 0

      setStats({
        totalContracts,
        highRiskContracts,
        expiringContracts,
        avgRiskScore,
      })
    } catch (error) {
      console.error("Error loading insights:", error)
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "Medium":
        return <TrendingUp className="h-4 w-4 text-yellow-400" />
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white text-balance">Contract Insights</h1>
          <p className="text-gray-400 mt-2">AI-powered analysis and recommendations for your contracts</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Contracts</p>
                  <p className="text-2xl font-bold text-white">{stats.totalContracts}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">{stats.highRiskContracts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.expiringContracts}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Risk Score</p>
                  <p className="text-2xl font-bold text-white">{stats.avgRiskScore.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Insights */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent AI Insights</CardTitle>
            <CardDescription className="text-gray-400">
              Latest analysis and recommendations from your contract portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No insights available yet</p>
                <p className="text-sm text-gray-500 mt-2">Upload some contracts to see AI-powered insights</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getRiskIcon(insight.risk_level)}
                        <h3 className="font-semibold text-white">{insight.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskColor(insight.risk_level)}>{insight.risk_level} Risk</Badge>
                        <Badge variant="outline" className="text-gray-300 border-gray-600">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{insight.summary}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Contract: {insight.contract_name}</span>
                      <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <Progress value={insight.confidence * 100} className="h-1 flex-1" />
                        <span className="text-xs text-gray-400">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
