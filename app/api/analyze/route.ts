import { NextRequest, NextResponse } from "next/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ""
const MODEL_ID = "google/gemini-2.0-flash-001"

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")

    const prompt = `
    Identify the e-waste item in this image. 
    Provide the output in JSON format with these exact keys:
    - product_name: Name of the device.
    - components: A list of main internal parts (as an array).
    - toxicity_level: High, Medium, or Low.
    - recyclable: Boolean (true/false).
    - harmful_substances: List of chemicals/metals present (as an array).
    - resell_value: Estimated resell value in Indian Rupees (INR) as a number. Calculate this as 30-35% of the estimated retail value of the device when it was new. Consider the device type, brand, and condition shown in the image.
    - market_estimate_min: Lower bound of the price range in INR.
    - market_estimate_max: Upper bound of the price range in INR.
    
    Return ONLY valid JSON, no additional text.
    `

    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "http-referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    }

    const payload = {
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API Error ${response.status}: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse API response" },
        { status: 500 }
      )
    }

    let result = JSON.parse(jsonMatch[0])

    if (typeof result.components === "string") {
      result.components = [result.components]
    } else if (!Array.isArray(result.components)) {
      result.components = []
    }

    if (typeof result.harmful_substances === "string") {
      result.harmful_substances = [result.harmful_substances]
    } else if (!Array.isArray(result.harmful_substances)) {
      result.harmful_substances = []
    }

    if (typeof result.recyclable === "string") {
      result.recyclable = result.recyclable.toLowerCase() in ["true", "yes", "1"]
    } else if (typeof result.recyclable !== "boolean") {
      result.recyclable = false
    }

    if (result.resell_value) {
      if (typeof result.resell_value === "string") {
        const numStr = result.resell_value.replace(/[^\d.]/g, "")
        result.resell_value = parseFloat(numStr) || 0
      }
    } else {
      result.resell_value = 0
    }

    if (!result.market_estimate_min) {
      result.market_estimate_min = Math.floor(result.resell_value * 0.8)
    }
    if (!result.market_estimate_max) {
      result.market_estimate_max = Math.ceil(result.resell_value * 1.2)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
