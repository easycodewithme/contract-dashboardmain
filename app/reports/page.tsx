"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Download, Calendar, AlertTriangle, CheckCircle, BarChart3, PieChart, Activity } from "lucide-react"

interface ReportData {
  totalContracts: number
  activeContracts: number
  expiredContracts: number
  expiringContracts: number
  riskDistribution: {
    high: number
    medium: number
    low: number
  }
  monthlyTrends: {
    month: string
    contracts: number
    risk_score: number
  }[]
  topRisks: {
    contract_name: string
    risk_level: string
    risk_score: string
    expiry_date: string
  }[]
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData>({
    totalContracts: 0,
    activeContracts: 0,
    expiredContracts: 0,
    expiringContracts: 0,
    riskDistribution: { high: 0, medium: 0, low: 0 },
    monthlyTrends: [],
    topRisks: [],
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
        await loadReportData(user.id)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const loadReportData = async (userId: string) => {
    try {
      const { data: contracts, error } = await supabase.from("documents").select("*").eq("user_id", userId)

      if (error) throw error

      const now = new Date()
      const threeMonthsFromNow = new Date()
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3)

      const totalContracts = contracts?.length || 0
      const activeContracts =
        contracts?.filter((c) => c.status === "Active" && new Date(c.expiry_date) > now).length || 0
      const expiredContracts = contracts?.filter((c) => new Date(c.expiry_date) <= now).length || 0
      const expiringContracts =
        contracts?.filter((c) => {
          const expiryDate = new Date(c.expiry_date)
          return expiryDate > now && expiryDate <= threeMonthsFromNow
        }).length || 0

      const riskDistribution = {
        high: contracts?.filter((c) => c.risk_score === "High").length || 0,
        medium: contracts?.filter((c) => c.risk_score === "Medium").length || 0,
        low: contracts?.filter((c) => c.risk_score === "Low").length || 0,
      }

      const topRisks =
        contracts
          ?.filter((c) => c.risk_score === "High")
          .slice(0, 5)
          .map((c) => ({
            contract_name: c.contract_name,
            risk_level: c.risk_score,
            risk_score: c.risk_score,
            expiry_date: c.expiry_date,
          })) || []

      // Mock monthly trends data
      const monthlyTrends = [
        { month: "Jan", contracts: Math.floor(totalContracts * 0.1), risk_score: 2.1 },
        { month: "Feb", contracts: Math.floor(totalContracts * 0.15), risk_score: 2.3 },
        { month: "Mar", contracts: Math.floor(totalContracts * 0.2), risk_score: 1.9 },
        { month: "Apr", contracts: Math.floor(totalContracts * 0.25), risk_score: 2.0 },
        { month: "May", contracts: Math.floor(totalContracts * 0.3), risk_score: 2.2 },
        { month: "Jun", contracts: totalContracts, risk_score: 2.1 },
      ]

      setReportData({
        totalContracts,
        activeContracts,
        expiredContracts,
        expiringContracts,
        riskDistribution,
        monthlyTrends,
        topRisks,
      })
    } catch (error) {
      console.error("Error loading report data:", error)
    }
  }

  const generateReport = () => {
    // Mock report generation
    alert("Report generation feature coming soon! This will export a comprehensive PDF report.")
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white text-balance">Contract Reports</h1>
            <p className="text-gray-400 mt-2">Comprehensive analytics and reporting for your contract portfolio</p>
          </div>
          <Button
            onClick={generateReport}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Contracts</p>
                  <p className="text-2xl font-bold text-white">{reportData.totalContracts}</p>
                  <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Contracts</p>
                  <p className="text-2xl font-bold text-green-400">{reportData.activeContracts}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {((reportData.activeContracts / reportData.totalContracts) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-400">{reportData.expiringContracts}</p>
                  <p className="text-xs text-yellow-400 mt-1">Next 3 months</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">{reportData.riskDistribution.high}</p>
                  <p className="text-xs text-red-400 mt-1">Require attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">Breakdown of contracts by risk level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-white">High Risk</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress
                    value={(reportData.riskDistribution.high / reportData.totalContracts) * 100}
                    className="w-32 h-2"
                  />
                  <span className="text-white w-8">{reportData.riskDistribution.high}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-white">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress
                    value={(reportData.riskDistribution.medium / reportData.totalContracts) * 100}
                    className="w-32 h-2"
                  />
                  <span className="text-white w-8">{reportData.riskDistribution.medium}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">Low Risk</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress
                    value={(reportData.riskDistribution.low / reportData.totalContracts) * 100}
                    className="w-32 h-2"
                  />
                  <span className="text-white w-8">{reportData.riskDistribution.low}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Risk Contracts */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              High Risk Contracts
            </CardTitle>
            <CardDescription className="text-gray-400">Contracts requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData.topRisks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">No high-risk contracts found</p>
                <p className="text-sm text-gray-500 mt-2">Your contract portfolio is in good shape!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportData.topRisks.map((contract, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <div>
                        <p className="font-medium text-white">{contract.contract_name}</p>
                        <p className="text-sm text-gray-400">
                          Expires: {new Date(contract.expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">High Risk</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Monthly Trends
            </CardTitle>
            <CardDescription className="text-gray-400">Contract volume and risk trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-white w-8">{trend.month}</span>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">{trend.contracts} contracts</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">Avg Risk: {trend.risk_score}</span>
                    <Progress value={(trend.contracts / reportData.totalContracts) * 100} className="w-24 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
