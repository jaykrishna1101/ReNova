"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  Search,
  Filter,
  MapPin,
  AlertCircle,
  Recycle,
  X,
  ChevronRight,
  SlidersHorizontal,
  IndianRupee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-secondary/50"><div className="text-muted-foreground">Loading map...</div></div> }
) as any
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
) as any
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
) as any
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
) as any

if (typeof window !== "undefined") {
  // @ts-ignore
  import("leaflet/dist/leaflet.css")
}

interface Listing {
  id: string
  seller_id: string
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
  created_at: string
}

interface ListingCardProps {
  listing: Listing
  distance?: number
  onHover?: () => void
  onLeave?: () => void
  onClick?: () => void
}

function ListingCard({ listing, distance, onHover, onLeave, onClick }: ListingCardProps) {
  const getToxicityColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "Low":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <motion.div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all">
        <div className="relative aspect-video bg-gradient-to-br from-card to-secondary">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Recycle className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getToxicityColor(listing.toxicity_level)}>
              {listing.toxicity_level} Toxicity
            </Badge>
          </div>
          {distance !== undefined && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {distance.toFixed(1)} km
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground mb-1">{listing.product_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IndianRupee className="w-4 h-4" />
              <span className="font-medium text-foreground">
                ₹{listing.market_estimate_min} - ₹{listing.market_estimate_max}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={listing.recyclable ? "default" : "secondary"}>
              {listing.recyclable ? (
                <>
                  <Recycle className="w-3 h-3 mr-1" />
                  Recyclable
                </>
              ) : (
                "Non-Recyclable"
              )}
            </Badge>
          </div>
          {listing.harmful_substances.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Harmful Substances:</p>
              <div className="flex flex-wrap gap-1">
                {listing.harmful_substances.slice(0, 3).map((substance, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {substance}
                  </Badge>
                ))}
                {listing.harmful_substances.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{listing.harmful_substances.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}


export function MarketplacePage() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090])
  const [mapZoom, setMapZoom] = useState(10)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })
          setMapCenter([lat, lng])
          setMapZoom(12)
        },
        () => {
          console.log("Location access denied")
        }
      )
    }
  }, [])

  const bounds = useMemo(() => {
    const latRange = 0.1
    const lngRange = 0.1
    return {
      min_lat: (mapCenter[0] - latRange).toString(),
      max_lat: (mapCenter[0] + latRange).toString(),
      min_lng: (mapCenter[1] - lngRange).toString(),
      max_lng: (mapCenter[1] + lngRange).toString(),
    }
  }, [mapCenter])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["listings", searchQuery, bounds],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchQuery,
        ...bounds,
      })

      const response = await fetch(`/api/listings/search?${params}`)
      if (!response.ok) throw new Error("Failed to fetch listings")
      return response.json()
    },
  })

  const listings: Listing[] = data?.listings || []

  const calculateDistance = useCallback(
    (lat: number, lng: number) => {
      if (!userLocation) return undefined
      const R = 6371
      const dLat = ((lat - userLocation.lat) * Math.PI) / 180
      const dLng = ((lng - userLocation.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    [userLocation]
  )

  const filteredListings = useMemo(() => {
    return listings
      .map((listing) => ({
        ...listing,
        distance: calculateDistance(listing.latitude, listing.longitude),
      }))
      .sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return 0
      })
  }, [listings, calculateDistance])

  const createMarkerIcon = useCallback((toxicity: string) => {
    if (typeof window === "undefined") return null

    const { Icon } = require("leaflet")
    const color = (() => {
      switch (toxicity) {
        case "High":
          return "#ef4444"
        case "Medium":
          return "#f59e0b"
        case "Low":
          return "#10b981"
        default:
          return "#6b7280"
      }
    })()

    const svg = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        ${toxicity === "High" ? '<circle cx="12" cy="12" r="8" fill="none" stroke="white" stroke-width="1" opacity="0.5"><animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/></circle>' : ''}
      </svg>
    `

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </Link>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for laptops, chargers, smartphone screens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        <div className="flex-1 relative">
          <MapContainer
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
            center={mapCenter}
            zoom={mapZoom}
            style={{ width: "100%", height: "100%", zIndex: 0 }}
            className="rounded-lg"
            whenCreated={(map) => {
              map.on("moveend", () => {
                const center = map.getCenter()
                setMapCenter([center.lat, center.lng])
                setMapZoom(map.getZoom())
              })
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={
                typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              subdomains="abcd"
            />
            {filteredListings.map((listing) => (
              <Marker
                key={listing.id}
                position={[listing.latitude, listing.longitude]}
                icon={createMarkerIcon(listing.toxicity_level)}
                eventHandlers={{
                  mouseover: () => setHoveredListingId(listing.id),
                  mouseout: () => setHoveredListingId(null),
                  click: () => setSelectedListing(listing),
                }}
              >
                {selectedListing?.id === listing.id && (
                  <Popup onClose={() => setSelectedListing(null)}>
                    <div className="p-2 space-y-2 min-w-[200px]">
                      <h3 className="font-semibold text-foreground">{listing.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ₹{listing.market_estimate_min} - ₹{listing.market_estimate_max}
                      </p>
                      <Badge
                        className={
                          listing.toxicity_level === "High"
                            ? "bg-red-500/20 text-red-500"
                            : listing.toxicity_level === "Medium"
                              ? "bg-yellow-500/20 text-yellow-500"
                              : "bg-green-500/20 text-green-500"
                        }
                      >
                        {listing.toxicity_level} Toxicity
                      </Badge>
                    </div>
                  </Popup>
                )}
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="w-[500px] border-l border-border overflow-y-auto bg-background">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {isLoading ? "Loading..." : `${filteredListings.length} Items Found`}
              </h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No listings found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    distance={listing.distance}
                    onHover={() => setHoveredListingId(listing.id)}
                    onLeave={() => setHoveredListingId(null)}
                    onClick={() => setSelectedListing(listing)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.product_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedListing.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedListing.image_url}
                      alt={selectedListing.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                    <p className="text-xl font-semibold text-foreground">
                      ₹{selectedListing.market_estimate_min} - ₹{selectedListing.market_estimate_max}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Toxicity Level</p>
                    <Badge
                      className={
                        selectedListing.toxicity_level === "High"
                          ? "bg-red-500/20 text-red-500"
                          : selectedListing.toxicity_level === "Medium"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-green-500/20 text-green-500"
                      }
                    >
                      {selectedListing.toxicity_level}
                    </Badge>
                  </Card>
                </div>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="text-foreground">
                      {selectedListing.address || `${selectedListing.latitude.toFixed(6)}, ${selectedListing.longitude.toFixed(6)}`}
                    </p>
                  </div>
                </Card>
                {selectedListing.harmful_substances.length > 0 && (
                  <Card className="p-4">
                    <p className="text-sm font-medium text-foreground mb-2">Harmful Substances</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedListing.harmful_substances.map((substance, i) => (
                        <Badge key={i} variant="outline">
                          {substance}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
                {selectedListing.components.length > 0 && (
                  <Card className="p-4">
                    <p className="text-sm font-medium text-foreground mb-2">Components</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedListing.components.map((component, i) => (
                        <Badge key={i} variant="secondary">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
