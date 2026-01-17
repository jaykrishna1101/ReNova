"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { Navbar } from "@/components/landing/navbar"

const MarketplacePage = dynamic(
  () => import("@/components/marketplace/marketplace-page").then((mod) => ({ default: mod.MarketplacePage })),
  { ssr: false }
)

export default function MarketplaceRoute() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/login?redirect=/marketplace")
          return
        }

        const { profile } = await getUserProfile(user.id)
        if (profile?.user_type !== "buyer") {
          router.push("/login?redirect=/marketplace")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login?redirect=/marketplace")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <>
      <Navbar />
      <MarketplacePage />
    </>
  )
}
