"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { SettingsIcon, Bell, Shield, Database, Download, Trash2, AlertTriangle, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    riskAlerts: true,
    expiryReminders: true,
    weeklyReports: false,
    autoBackup: true,
    dataRetention: "1year",
  })
  const [stats, setStats] = useState({
    totalContracts: 0,
    storageUsed: 0,
    lastBackup: null as string | null,
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
        await loadUserStats(user.id)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const loadUserStats = async (userId: string) => {
    try {
      const { data: contracts, error } = await supabase.from("documents").select("file_size").eq("user_id", userId)

      if (error) throw error

      const totalContracts = contracts?.length || 0
      const storageUsed = contracts?.reduce((total, contract) => total + (contract.file_size || 0), 0) || 0

      setStats({
        totalContracts,
        storageUsed,
        lastBackup: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    // Mock save settings
    alert("Settings saved successfully!")
  }

  const exportData = () => {
    alert("Data export feature coming soon! This will download all your contract data.")
  }

  const deleteAllData = () => {
    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      alert("Data deletion feature coming soon!")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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
          <h1 className="text-3xl font-bold text-white text-balance">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account preferences and application settings</p>
        </div>

        {/* Account Information */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription className="text-gray-400">Your account details and subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Email Address</Label>
                <Input value={user?.email || ""} disabled className="bg-white/5 border-white/10 text-gray-300 mt-1" />
              </div>
              <div>
                <Label className="text-gray-300">Account Type</Label>
                <div className="mt-1">
                  <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">Free Plan</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-white">{stats.totalContracts}</p>
                <p className="text-sm text-gray-400">Total Contracts</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-white">{formatFileSize(stats.storageUsed)}</p>
                <p className="text-sm text-gray-400">Storage Used</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-green-400">Active</p>
                <p className="text-sm text-gray-400">Account Status</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure how you want to be notified about contract events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive email updates about your contracts</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Risk Alerts</Label>
                <p className="text-sm text-gray-400">Get notified when high-risk contracts are detected</p>
              </div>
              <Switch
                checked={settings.riskAlerts}
                onCheckedChange={(checked) => handleSettingChange("riskAlerts", checked)}
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Expiry Reminders</Label>
                <p className="text-sm text-gray-400">Receive alerts before contracts expire</p>
              </div>
              <Switch
                checked={settings.expiryReminders}
                onCheckedChange={(checked) => handleSettingChange("expiryReminders", checked)}
              />
            </div>
            <Separator className="bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Weekly Reports</Label>
                <p className="text-sm text-gray-400">Get weekly summary reports via email</p>
              </div>
              <Switch
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your data storage and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto Backup</Label>
                <p className="text-sm text-gray-400">Automatically backup your contract data</p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>
            <Separator className="bg-white/10" />
            <div>
              <Label className="text-white">Data Retention</Label>
              <p className="text-sm text-gray-400 mb-3">How long to keep your contract data</p>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleSettingChange("dataRetention", e.target.value)}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
                <option value="forever">Forever</option>
              </select>
            </div>
            {stats.lastBackup && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Last backup: {new Date(stats.lastBackup).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription className="text-gray-400">Export or delete your contract data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h3 className="font-medium text-white">Export Data</h3>
                <p className="text-sm text-gray-400">Download all your contract data in JSON format</p>
              </div>
              <Button
                onClick={exportData}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div>
                <h3 className="font-medium text-white flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-400" />
                  Delete All Data
                </h3>
                <p className="text-sm text-gray-400">Permanently delete all your contracts and data</p>
              </div>
              <Button onClick={deleteAllData} variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
