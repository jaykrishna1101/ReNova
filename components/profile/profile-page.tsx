"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Shield,
  Settings,
  Leaf,
  MapPin,
  LogOut,
  Edit,
  CheckCircle2,
  RefreshCw,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, SignOut } from "lucide-react"
import { toast } from "sonner"
import { signOut } from "@/lib/auth"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type Tab = "general" | "impact" | "security" | "preferences"

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  user_type: "seller" | "buyer"
  primary_role?: "seller" | "buyer"
  anonymous_sharing?: boolean
  last_location?: { lat: number; lng: number; address: string }
  last_location_updated?: string
  isVerified?: boolean
  impact?: {
    leadKg: number
    mercuryGrams: number
    points: number
    itemsRecycled: number
    activeListings: number
  }
}

function ImpactCard({ title, value, unit, icon: Icon, color }: { title: string; value: number; unit: string; icon: any; color: "green" | "blue" | "primary" }) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-500 border-green-500/30",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    primary: "bg-primary/10 text-primary border-primary/30",
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-secondary/50 border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <Badge className={colorClasses[color]}>{unit}</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </Card>
  )
}

function GeneralTab({ profile, onUpdate }: { profile: UserProfile; onUpdate: (data: any) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.name || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
  })

  const handleSave = () => {
    onUpdate(formData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">General Information</h2>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Avatar URL</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="mt-1"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">{profile.name}</h3>
                  {profile.isVerified && (
                    <Badge className="bg-primary/20 text-primary">Verified Eco-Citizen</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">{profile.email}</p>
                {profile.bio && <p className="text-foreground">{profile.bio}</p>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function ImpactTab({ profile }: { profile: UserProfile }) {
  const impact = profile.impact || { leadKg: 0, mercuryGrams: 0, points: 0, itemsRecycled: 0, activeListings: 0 }

  const chartData = [
    { month: "Jan", items: 2 },
    { month: "Feb", items: 4 },
    { month: "Mar", items: 3 },
    { month: "Apr", items: 5 },
    { month: "May", items: 7 },
    { month: "Jun", items: impact.itemsRecycled },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Environmental Impact Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImpactCard
          title="Lead Diverted"
          value={impact.leadKg}
          unit="kg"
          icon={Leaf}
          color="green"
        />
        <ImpactCard
          title="Mercury Neutralized"
          value={impact.mercuryGrams}
          unit="g"
          icon={Shield}
          color="blue"
        />
        <ImpactCard
          title="Eco-Points Earned"
          value={impact.points}
          unit="pts"
          icon={CheckCircle2}
          color="primary"
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contribution Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="items" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

function SecurityTab({ onLogout }: { onLogout: () => void }) {
  const [showLogoutAll, setShowLogoutAll] = useState(false)

  const handleLogoutAll = async () => {
    try {
      const response = await fetch("/api/profile/sessions", { method: "DELETE" })
      if (response.ok) {
        await signOut()
        window.location.href = "/"
      } else {
        toast.error("Failed to logout from all devices")
      }
    } catch (error) {
      toast.error("Failed to logout from all devices")
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Trust & Privacy</h2>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Privacy</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Anonymous Impact Sharing</p>
            <p className="text-sm text-muted-foreground">
              Allow your contributions to be included in city-wide stats without showing your name
            </p>
          </div>
          <Switch />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Device Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Current Session</p>
              <p className="text-sm text-muted-foreground">Active now</p>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              Active
            </Badge>
          </div>
        </div>
        <Separator className="my-4" />
        <Button
          variant="destructive"
          onClick={() => setShowLogoutAll(true)}
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout from All Devices
        </Button>
      </Card>

      {showLogoutAll && (
        <Card className="p-6 border-red-500/50">
          <p className="text-foreground mb-4">Are you sure you want to logout from all devices?</p>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleLogoutAll}>
              Yes, Logout All
            </Button>
            <Button variant="outline" onClick={() => setShowLogoutAll(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function PreferencesTab({ profile, onUpdate }: { profile: UserProfile; onUpdate: (data: any) => void }) {
  const router = useRouter()
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    profile.last_location || null
  )
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const refreshLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || ""}`
            )
            const data = await response.json()
            const address = data.results?.[0]?.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            
            const newLocation = { lat: latitude, lng: longitude, address }
            setLocation(newLocation)
            onUpdate({ last_location: newLocation })
            toast.success("Location updated successfully")
          } catch (error) {
            const newLocation = {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }
            setLocation(newLocation)
            onUpdate({ last_location: newLocation })
            toast.success("Location updated successfully")
          } finally {
            setIsGettingLocation(false)
          }
        },
        () => {
          toast.error("Failed to get location")
          setIsGettingLocation(false)
        },
        { enableHighAccuracy: true }
      )
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Preferences</h2>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Role Preference</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Primary Role</p>
            <p className="text-sm text-muted-foreground">
              Choose your primary role to optimize the dashboard experience
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={profile.primary_role === "seller" ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate({ primary_role: "seller" })}
            >
              Seller
            </Button>
            <Button
              variant={profile.primary_role === "buyer" ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdate({ primary_role: "buyer" })}
            >
              Buyer
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Location Management</h3>
        <div className="space-y-4">
          {location ? (
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium text-foreground">Last Known Pickup Point</p>
              </div>
              <p className="text-sm text-muted-foreground">{location.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">No location set</p>
          )}
          <Button onClick={refreshLocation} disabled={isGettingLocation} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isGettingLocation ? "animate-spin" : ""}`} />
            {isGettingLocation ? "Getting Location..." : "Refresh Location"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>("general")

  const { data, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile")
      if (!response.ok) throw new Error("Failed to fetch profile")
      return response.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      if (!response.ok) throw new Error("Failed to update profile")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] })
      toast.success("Profile updated successfully")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })

  const profile: UserProfile = data?.profile || {
    id: "",
    name: "",
    email: "",
    user_type: "seller",
  }

  const handleUpdate = (updateData: any) => {
    updateMutation.mutate(updateData)
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  const tabs = [
    { id: "general" as Tab, label: "General", icon: User },
    { id: "impact" as Tab, label: "Impact", icon: Leaf },
    { id: "security" as Tab, label: "Security", icon: Shield },
    { id: "preferences" as Tab, label: "Preferences", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Profile & Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="p-4 backdrop-blur-lg bg-card/80 border-border/50">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
                <Separator className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </Card>
          </aside>

          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-64" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "general" && <GeneralTab profile={profile} onUpdate={handleUpdate} />}
                  {activeTab === "impact" && <ImpactTab profile={profile} />}
                  {activeTab === "security" && <SecurityTab onLogout={handleLogout} />}
                  {activeTab === "preferences" && <PreferencesTab profile={profile} onUpdate={handleUpdate} />}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
