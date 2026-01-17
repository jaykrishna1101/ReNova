"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Webcam from "react-webcam"
import { Camera, Upload, MapPin, CheckCircle2, AlertCircle, Loader2, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatedRobot } from "@/components/animated-robot"
import { supabase } from "@/lib/supabase/client"

type Phase = "capture" | "analyze" | "locate"

interface AnalysisResult {
  product_name: string
  components: string[]
  toxicity_level: "High" | "Medium" | "Low"
  recyclable: boolean
  harmful_substances: string[]
  resell_value: number
  market_estimate_min: number
  market_estimate_max: number
}

export function SellEwastePage() {
  const router = useRouter()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>("capture")
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState("")

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setPhase("analyze")
      analyzeImage(imageSrc)
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setCapturedImage(result)
        setPhase("analyze")
        analyzeImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisStatus("Preparing image...")

    try {
      const base64Data = imageDataUrl.split(",")[1]
      const blob = await fetch(imageDataUrl).then((res) => res.blob())
      const file = new File([blob], "image.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("image", file)

      setAnalysisProgress(20)
      setAnalysisStatus("Detecting materials...")

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      setAnalysisProgress(60)
      setAnalysisStatus("Calculating toxicity levels...")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Analysis failed")
      }

      setAnalysisProgress(80)
      setAnalysisStatus("Checking market value...")

      const result = await response.json()

      setAnalysisProgress(100)
      setAnalysisStatus("Analysis complete!")

      setAnalysisResult(result)
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 500)
    } catch (error) {
      setIsAnalyzing(false)
      toast.error(error instanceof Error ? error.message : "Failed to analyze image")
      setPhase("capture")
    }
  }

  const getLocation = () => {
    setIsGettingLocation(true)
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || ""}`
          )
          const data = await response.json()
          const address = data.results?.[0]?.formatted || `${latitude}, ${longitude}`

          setLocation({ lat: latitude, lng: longitude, address })
          setIsGettingLocation(false)
        } catch (error) {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          })
          setIsGettingLocation(false)
        }
      },
      (error) => {
        toast.error("Failed to get location. Please enable location permissions.")
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const publishListing = async () => {
    if (!analysisResult || !location) {
      toast.error("Please complete analysis and set location")
      return
    }

    setIsPublishing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error("You must be logged in to publish listings")
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_name: analysisResult.product_name,
          toxicity_level: analysisResult.toxicity_level,
          recyclable: analysisResult.recyclable,
          harmful_substances: analysisResult.harmful_substances,
          components: analysisResult.components,
          resell_value: analysisResult.resell_value,
          market_estimate_min: analysisResult.market_estimate_min,
          market_estimate_max: analysisResult.market_estimate_max,
          image_url: capturedImage,
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to publish listing")
      }

      toast.success("Listing published successfully!")
      router.push("/marketplace")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish listing")
    } finally {
      setIsPublishing(false)
    }
  }

  const resetFlow = () => {
    setPhase("capture")
    setCapturedImage(null)
    setAnalysisResult(null)
    setLocation(null)
    setAnalysisProgress(0)
    setAnalysisStatus("")
  }

  const getToxicityColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-500 bg-red-500/20"
      case "Medium":
        return "text-yellow-500 bg-yellow-500/20"
      case "Low":
        return "text-green-500 bg-green-500/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Sell Your E-Waste</h1>
          <p className="text-muted-foreground mt-2">Capture, analyze, and list your e-waste in three simple steps</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { id: "capture", label: "Capture", number: 1 },
              { id: "analyze", label: "Analyze", number: 2 },
              { id: "locate", label: "Locate", number: 3 },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      phase === step.id
                        ? "bg-primary text-primary-foreground scale-110"
                        : phase === "analyze" && step.id === "capture"
                          ? "bg-primary/20 text-primary"
                          : phase === "locate" && ["capture", "analyze"].includes(step.id)
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {phase === "locate" && ["capture", "analyze"].includes(step.id) ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      phase === step.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-16 md:w-24 mx-4 transition-all ${
                      phase === "analyze" && step.id === "capture"
                        ? "bg-primary"
                        : phase === "locate"
                          ? "bg-primary"
                          : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex gap-3 mb-6">
                  <Button
                    variant={captureMode === "camera" ? "default" : "outline"}
                    onClick={() => setCaptureMode("camera")}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Live Camera
                  </Button>
                  <Button
                    variant={captureMode === "upload" ? "default" : "outline"}
                    onClick={() => setCaptureMode("upload")}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>

                {captureMode === "camera" ? (
                  <div className="relative">
                    <div className="relative aspect-video bg-card rounded-xl overflow-hidden border-2 border-primary/20">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          facingMode: "environment",
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-4 border-primary/50 rounded-lg shadow-lg shadow-primary/20" />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <Button
                        size="lg"
                        onClick={capturePhoto}
                        className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                      >
                        <Camera className="w-8 h-8" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-foreground font-medium mb-2">Drag & Drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {phase === "analyze" && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {isAnalyzing ? (
                <Card className="p-8">
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <AnimatedRobot isPasswordFocused={false} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-foreground">{analysisStatus}</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden max-w-md mx-auto">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/80"
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{analysisProgress}%</p>
                    </div>
                  </div>
                </Card>
              ) : analysisResult ? (
                <>
                  {capturedImage && (
                    <Card className="p-4 mb-6">
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFlow}
                            className="bg-background/80 backdrop-blur-sm"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Card className="p-6 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{analysisResult.product_name}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-xl ${getToxicityColor(analysisResult.toxicity_level)}`}>
                        <p className="text-sm font-medium mb-1">Toxicity Level</p>
                        <p className="text-2xl font-bold">{analysisResult.toxicity_level}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/20">
                        <p className="text-sm font-medium mb-1 text-foreground">Recyclable</p>
                        <p className="text-2xl font-bold text-primary">{analysisResult.recyclable ? "Yes" : "No"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/20">
                        <p className="text-sm font-medium mb-1 text-foreground">Expected Price</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{analysisResult.market_estimate_min} - ₹{analysisResult.market_estimate_max} ⭐
                        </p>
                      </div>
                    </div>

                    {analysisResult.harmful_substances.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-3">Harmful Substances Detected</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {analysisResult.harmful_substances.map((substance, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20"
                            >
                              <div className="w-2 h-2 rounded-full bg-orange-500" />
                              <span className="text-sm text-foreground">{substance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.components.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-3">Components Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.components.map((component, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-secondary text-foreground text-sm"
                            >
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={resetFlow} className="flex-1">
                        Retake Photo
                      </Button>
                      <Button onClick={() => setPhase("locate")} className="flex-1">
                        Continue to Location
                      </Button>
                    </div>
                  </Card>
                </>
              ) : null}
            </motion.div>
          )}

          {phase === "locate" && (
            <motion.div
              key="locate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Set Pickup Location</h3>
                  <p className="text-muted-foreground">
                    Allow location access to show your item to nearby buyers
                  </p>
                </div>

                {!location ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <Button
                      size="lg"
                      onClick={getLocation}
                      disabled={isGettingLocation}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Getting location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Set Pickup Location via GPS
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Location Set</p>
                          <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={getLocation}
                      disabled={isGettingLocation}
                      className="w-full"
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating location...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          Update Location
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setPhase("analyze")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={publishListing}
                    disabled={!location || isPublishing}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Listing"
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
