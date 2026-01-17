import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") || ""
    const toxicityLevel = searchParams.get("toxicity_level")
    const recyclable = searchParams.get("recyclable")
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")
    const minLat = searchParams.get("min_lat")
    const maxLat = searchParams.get("max_lat")
    const minLng = searchParams.get("min_lng")
    const maxLng = searchParams.get("max_lng")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("product_name", `%${search}%`)
    }

    if (toxicityLevel) {
      query = query.eq("toxicity_level", toxicityLevel)
    }

    if (recyclable !== null && recyclable !== "") {
      query = query.eq("recyclable", recyclable === "true")
    }

    if (minPrice) {
      query = query.gte("market_estimate_min", parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte("market_estimate_max", parseFloat(maxPrice))
    }

    if (minLat && maxLat && minLng && maxLng) {
      query = query
        .gte("latitude", parseFloat(minLat))
        .lte("latitude", parseFloat(maxLat))
        .gte("longitude", parseFloat(minLng))
        .lte("longitude", parseFloat(maxLng))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ listings: data || [], count: data?.length || 0 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
