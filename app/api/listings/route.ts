import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({ error: authError.message || "Unauthorized" }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found. Please log in." }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.user_type !== "seller") {
      return NextResponse.json({ error: "Only sellers can create listings" }, { status: 403 })
    }

    const body = await request.json()
    const {
      product_name,
      toxicity_level,
      recyclable,
      harmful_substances,
      components,
      resell_value,
      market_estimate_min,
      market_estimate_max,
      image_url,
      latitude,
      longitude,
      address,
    } = body

    if (!product_name || !toxicity_level || recyclable === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: product_name, toxicity_level, recyclable" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        seller_id: user.id,
        product_name,
        toxicity_level,
        recyclable,
        harmful_substances: harmful_substances || [],
        components: components || [],
        resell_value: resell_value || 0,
        market_estimate_min: market_estimate_min || 0,
        market_estimate_max: market_estimate_max || 0,
        image_url,
        latitude,
        longitude,
        address,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, listing: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("seller_id")

    let query = supabase.from("listings").select("*").eq("status", "active")

    if (sellerId) {
      query = query.eq("seller_id", sellerId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ listings: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
