"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, Building, Phone, MapPin, Edit, Save, X } from "lucide-react"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  company: string
  jobTitle: string
  phone: string
  location: string
  bio: string
  joinedDate: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    location: "",
    bio: "",
    joinedDate: "",
  })
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    location: "",
    bio: "",
    joinedDate: "",
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
        loadUserProfile(user)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const loadUserProfile = (user: any) => {
    // Mock profile data based on user email
    const mockProfile: UserProfile = {
      firstName: user.email?.split("@")[0]?.split(".")[0] || "John",
      lastName: user.email?.split("@")[0]?.split(".")[1] || "Doe",
      email: user.email || "",
      company: "Acme Corporation",
      jobTitle: "Contract Manager",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      bio: "Experienced contract manager with over 5 years in legal operations and contract lifecycle management.",
      joinedDate: user.created_at || new Date().toISOString(),
    }
    setProfile(mockProfile)
    setOriginalProfile(mockProfile)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Mock save functionality
    setOriginalProfile(profile)
    setEditing(false)
    alert("Profile updated successfully!")
  }

  const handleCancel = () => {
    setProfile(originalProfile)
    setEditing(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
            <h1 className="text-3xl font-bold text-white text-balance">Profile Settings</h1>
            <p className="text-gray-400 mt-2">Manage your personal information and preferences</p>
          </div>
          {!editing ? (
            <Button
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 bg-purple-600">
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  {getInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-400">
                  {profile.jobTitle} at {profile.company}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <span className="text-sm text-gray-400 flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Joined {new Date(profile.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-400">Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">First Name</Label>
                {editing ? (
                  <Input
                    value={profile.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.firstName}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-300">Last Name</Label>
                {editing ? (
                  <Input
                    value={profile.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-gray-300 flex items-center">
                <Mail className="mr-1 h-4 w-4" />
                Email Address
              </Label>
              <p className="text-gray-400 mt-1 p-2">{profile.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <Separator className="bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  Company
                </Label>
                {editing ? (
                  <Input
                    value={profile.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.company}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-300">Job Title</Label>
                {editing ? (
                  <Input
                    value={profile.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.jobTitle}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 flex items-center">
                  <Phone className="mr-1 h-4 w-4" />
                  Phone Number
                </Label>
                {editing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.phone}</p>
                )}
              </div>
              <div>
                <Label className="text-gray-300 flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  Location
                </Label>
                {editing ? (
                  <Input
                    value={profile.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                ) : (
                  <p className="text-white mt-1 p-2">{profile.location}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Bio</Label>
              {editing ? (
                <Textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-white mt-1 p-2">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Account Statistics</CardTitle>
            <CardDescription className="text-gray-400">Your activity and usage overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-purple-400">12</p>
                <p className="text-sm text-gray-400">Contracts Uploaded</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-green-400">8</p>
                <p className="text-sm text-gray-400">Active Contracts</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-yellow-400">24</p>
                <p className="text-sm text-gray-400">AI Queries Made</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
