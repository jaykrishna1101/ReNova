"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Grid3x3,
  List,
  Leaf,
  TrendingUp,
  Shield,
  MoreVertical,
  Download,
  MapPin,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Recycle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { AnimatedRobot } from "@/components/animated-robot"

interface Listing {
  id: string
  product_name: string
  toxicity_level: "High" | "Medium" | "Low"
  recyclable: boolean
  harmful_substances: string[]
  components: string[]
  resell_value: number
  market_estimate_min: number
  market_estimate_max: number
  image_url: string | null
  latitude: number
  longitude: number
  address: string | null
  status: "active" | "sold" | "removed" | "pending"
  created_at: string
}

const CHEMICAL_SYMBOLS: Record<string, string> = {
  Lead: "Pb",
  Mercury: "Hg",
  Cadmium: "Cd",
  Arsenic: "As",
  Lithium: "Li",
  "Brominated Flame Retardants (BFRs)": "BFR",
  Chromium: "Cr",
  Beryllium: "Be",
}

const CHEMICAL_COLORS: Record<string, string> = {
  Lead: "#ef4444",
  Mercury: "#f59e0b",
  Cadmium: "#dc2626",
  Arsenic: "#991b1b",
  Lithium: "#3b82f6",
  "Brominated Flame Retardants (BFRs)": "#a855f7",
  Chromium: "#6366f1",
  Beryllium: "#14b8a6",
}

function StatsBar({ listings }: { listings: Listing[] }) {
  const activeListings = listings.filter((l) => l.status === "active")
  const totalValue = activeListings.reduce(
    (sum, listing) => sum + (listing.market_estimate_max + listing.market_estimate_min) / 2,
    0
  )
  const totalToxicity = activeListings.reduce((sum, listing) => {
    return sum + (listing.toxicity_level === "High" ? 3 : listing.toxicity_level === "Medium" ? 2 : 1)
  }, 0)
  const ecoScore = Math.min(100, Math.round((activeListings.length * 10) + (totalToxicity * 5)))

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Items Recycled</p>
            <p className="text-3xl font-bold text-foreground">{listings.filter((l) => l.status === "sold").length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Recycle className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active Value</p>
            <p className="text-3xl font-bold text-foreground">₹{Math.round(totalValue).toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Toxicity Prevented</p>
            <p className="text-3xl font-bold text-foreground">{totalToxicity}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Eco-Score</p>
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-secondary"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(ecoScore / 100) * 125.6} 125.6`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{ecoScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ListingCard({ listing, viewMode, onDelete }: { listing: Listing; viewMode: "grid" | "list"; onDelete: (id: string) => void }) {
  const router = useRouter()

  const getStatusBadge = () => {
    switch (listing.status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Live</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending Pickup</Badge>
      case "sold":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Sold / Recycled</Badge>
      default:
        return null
    }
  }

  const topChemicals = listing.harmful_substances.slice(0, 3)

  const downloadReport = async () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text("AI Toxicity Analysis Report", 20, 20)
      doc.setFontSize(12)
      doc.text(`Product: ${listing.product_name}`, 20, 35)
      doc.text(`Toxicity Level: ${listing.toxicity_level}`, 20, 45)
      doc.text(`Recyclable: ${listing.recyclable ? "Yes" : "No"}`, 20, 55)
      doc.text(`Market Estimate: ₹${listing.market_estimate_min} - ₹${listing.market_estimate_max}`, 20, 65)
      doc.text("Harmful Substances:", 20, 80)
      listing.harmful_substances.forEach((substance, i) => {
        doc.text(`  • ${substance}`, 20, 90 + i * 10)
      })
      doc.save(`${listing.product_name}-report.pdf`)
      toast.success("Report downloaded successfully")
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  const handleManageLocation = () => {
    router.push(`/sell?listing=${listing.id}`)
  }

  if (viewMode === "list") {
    return (
      <Card className="p-4 hover:border-primary/50 transition-all">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.product_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
            <div className="absolute top-1 right-1">
              <Badge className="bg-primary/90 text-primary-foreground text-xs">AI-Verified</Badge>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{listing.product_name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge()}
                  <Badge
                    variant="outline"
                    className={
                      listing.toxicity_level === "High"
                        ? "border-red-500/30 text-red-500"
                        : listing.toxicity_level === "Medium"
                          ? "border-yellow-500/30 text-yellow-500"
                          : "border-green-500/30 text-green-500"
                    }
                  >
                    {listing.toxicity_level} Toxicity
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={downloadReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download AI Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleManageLocation}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage Location
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(listing.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete/Deactivate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>₹{listing.market_estimate_min} - ₹{listing.market_estimate_max}</span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>GPS Locked</span>
              </div>
            </div>
            {topChemicals.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Top Chemicals:</span>
                {topChemicals.map((chemical) => (
                  <div
                    key={chemical}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: CHEMICAL_COLORS[chemical] || "#6b7280" }}
                    title={chemical}
                  >
                    {CHEMICAL_SYMBOLS[chemical] || chemical.charAt(0)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:border-primary/50 transition-all">
        <div className="relative aspect-video bg-gradient-to-br from-card to-secondary">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <AlertCircle className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary/90 text-primary-foreground text-xs">AI-Verified</Badge>
          </div>
          <div className="absolute top-2 left-2">{getStatusBadge()}</div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">GPS Locked</span>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1 truncate">{listing.product_name}</h3>
              <p className="text-sm font-medium text-primary">
                ₹{listing.market_estimate_min} - ₹{listing.market_estimate_max}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download AI Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleManageLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Manage Location
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(listing.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete/Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                listing.toxicity_level === "High"
                  ? "border-red-500/30 text-red-500"
                  : listing.toxicity_level === "Medium"
                    ? "border-yellow-500/30 text-yellow-500"
                    : "border-green-500/30 text-green-500"
              }
            >
              {listing.toxicity_level} Toxicity
            </Badge>
          </div>
          {topChemicals.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Top Chemicals:</span>
              {topChemicals.map((chemical) => (
                <div
                  key={chemical}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: CHEMICAL_COLORS[chemical] || "#6b7280" }}
                  title={chemical}
                >
                  {CHEMICAL_SYMBOLS[chemical] || chemical.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function EmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <AnimatedRobot isPasswordFocused={false} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl font-bold text-foreground mb-4"
      >
        Your inventory is empty
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-muted-foreground mb-8 max-w-md"
      >
        Ready to turn your old tech into eco-points? Start scanning your e-waste and contribute to a sustainable future.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={() => router.push("/sell")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Start New Scan
        </Button>
      </motion.div>
    </div>
  )
}

export function SellerListingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"recent" | "value" | "toxicity">("recent")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading } = useQuery({
    queryKey: ["seller-listings", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      const response = await fetch(`/api/listings/seller?${params}`)
      if (!response.ok) throw new Error("Failed to fetch listings")
      return response.json()
    },
    staleTime: 30000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch("/api/listings/seller", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (!response.ok) throw new Error("Failed to delete listing")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-listings"] })
      toast.success("Listing deactivated successfully")
    },
    onError: () => {
      toast.error("Failed to deactivate listing")
    },
  })

  const listings: Listing[] = data?.listings || []

  const sortedListings = useMemo(() => {
    const sorted = [...listings]
    switch (sortBy) {
      case "value":
        return sorted.sort((a, b) => (b.market_estimate_max + b.market_estimate_min) - (a.market_estimate_max + a.market_estimate_min))
      case "toxicity":
        const toxicityOrder = { High: 3, Medium: 2, Low: 1 }
        return sorted.sort((a, b) => toxicityOrder[b.toxicity_level] - toxicityOrder[a.toxicity_level])
      case "recent":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [listings, sortBy])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to deactivate this listing?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">My Listings</h1>
              <p className="text-muted-foreground mt-2">Manage your e-waste listings and track your impact</p>
            </div>
            <Button onClick={() => router.push("/sell")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatsBar listings={listings} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="value">Highest Value</SelectItem>
                    <SelectItem value="toxicity">Most Harmful</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Live</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} viewMode="grid" onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} viewMode="list" onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
