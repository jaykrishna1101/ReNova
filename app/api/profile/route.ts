import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    const { data: listings } = await supabase
      .from("listings")
      .select("toxicity_level, harmful_substances, status")
      .eq("seller_id", user.id)

    const impact = calculateImpact(listings || [])

    return NextResponse.json({
      profile: {
        ...profile,
        impact,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, avatar_url, primary_role, anonymous_sharing, last_location } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (primary_role !== undefined) updateData.primary_role = primary_role
    if (anonymous_sharing !== undefined) updateData.anonymous_sharing = anonymous_sharing
    if (last_location !== undefined) {
      updateData.last_location = last_location
      updateData.last_location_updated = new Date().toISOString()
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

function calculateImpact(listings: any[]) {
  const soldListings = listings.filter((l) => l.status === "sold")
  const activeListings = listings.filter((l) => l.status === "active")
  
  let leadKg = 0
  let mercuryGrams = 0
  let points = 0

  soldListings.forEach((listing) => {
    const substances = listing.harmful_substances || []
    if (substances.includes("Lead")) leadKg += 0.5
    if (substances.includes("Mercury")) mercuryGrams += 0.1
    
    const toxicityMultiplier = listing.toxicity_level === "High" ? 3 : listing.toxicity_level === "Medium" ? 2 : 1
    points += 10 * toxicityMultiplier
  })

  activeListings.forEach((listing) => {
    const toxicityMultiplier = listing.toxicity_level === "High" ? 2 : listing.toxicity_level === "Medium" ? 1.5 : 1
    points += 5 * toxicityMultiplier
  })

  return {
    leadKg: parseFloat(leadKg.toFixed(1)),
    mercuryGrams: parseFloat(mercuryGrams.toFixed(1)),
    points: Math.round(points),
    itemsRecycled: soldListings.length,
    activeListings: activeListings.length,
  }
}
