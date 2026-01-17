"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { Scan, MapPin, Grid3X3, TrendingUp, AlertTriangle, Leaf, Clock, ShieldCheck } from "lucide-react"
import Image from "next/image"

function AIScannerSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [scanProgress, setScanProgress] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true)
      setScanProgress(0)
      setShowResults(false)

      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setShowResults(true)
            }, 300)
            return 100
          }
          return prev + 1
        })
      }, 35)

      return () => clearInterval(interval)
    }
  }, [isInView, hasStarted])

  const results = [
    { label: "Lead", value: "40%", color: "text-orange-400", bg: "bg-orange-500/20" },
    { label: "Mercury", value: "High", color: "text-red-400", bg: "bg-red-500/20" },
    { label: "Toxicity Level", value: "High", color: "text-red-500", bg: "bg-red-500/20" },
  ]

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="relative aspect-video bg-gradient-to-br from-card to-secondary rounded-2xl overflow-hidden border border-border/50">
          <Image
            src="/broken-laptop-computer-e-waste.jpg"
            alt="E-waste laptop for scanning"
            fill
            className="object-cover opacity-80"
          />
          {scanProgress > 0 && scanProgress < 100 && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: `${scanProgress}%` }}
              className="absolute left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/50"
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-foreground font-medium">AI Toxicity Scanner</h4>
              <p className="text-sm text-muted-foreground">
                {showResults ? "Analysis complete" : scanProgress > 0 ? "Analyzing components..." : "Ready to scan"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {showResults ? "Analysis Complete" : scanProgress > 0 ? "Scanning..." : "Ready to scan"}
              </span>
              <span className="text-primary">{scanProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showResults ? { opacity: 1, y: 0 } : {}}
            className="space-y-3"
          >
            {showResults &&
              results.map((result, i) => (
                <motion.div
                  key={result.label}
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${result.bg} border border-border/30`}
                >
                  <span className="text-foreground text-sm">{result.label}</span>
                  <span className={`font-bold ${result.color}`}>{result.value}</span>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function ImpactMapSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="relative aspect-[16/9] max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/50">
        <div className="absolute inset-0">
          <Image
            src="/images/muted-blue.png"
            alt="City map"
            fill
            className="object-cover"
            style={{ filter: "brightness(0.4) saturate(0.5) hue-rotate(150deg)" }}
          />
        </div>

        {[
          { x: "25%", y: "35%" },
          { x: "45%", y: "50%" },
          { x: "65%", y: "30%" },
          { x: "75%", y: "60%" },
          { x: "35%", y: "65%" },
          { x: "55%", y: "45%" },
        ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute w-8 h-8 rounded-full bg-primary/30"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: i * 0.3 }}
                />
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50" />
              </div>
            </motion.div>
        ))}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-xl rounded-xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">342kg</p>
              <p className="text-sm text-muted-foreground">E-Waste recycled in your city this week</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function CategoriesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const categories = [
    { name: "Laptops", price: "₹2,500 - ₹15,000", image: "/laptop-computer-device.jpg" },
    { name: "Mobiles", price: "₹500 - ₹8,000", image: "/smartphone-mobile-phone.jpg" },
    { name: "Industrial", price: "₹10,000 - ₹50,000", image: "/industrial-electronic-equipment.jpg" },
    { name: "Accessories", price: "₹100 - ₹2,000", image: "/electronic-accessories-cables.jpg" },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.name}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="group relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative">
            <div className="aspect-square mb-4 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
              <Image
                src={cat.image || "/placeholder.svg"}
                alt={cat.name}
                width={200}
                height={200}
                className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h4 className="text-foreground font-medium text-lg">{cat.name}</h4>
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              whileHover={{ opacity: 1, height: "auto" }}
              className="text-primary text-sm mt-1"
            >
              Avg: {cat.price}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const stats = [
    { icon: Leaf, value: "500kg+", label: "Lead Kept from Soil" },
    { icon: ShieldCheck, value: "1,200+", label: "Verified Buyers" },
    { icon: Clock, value: "15min", label: "Average Pickup Time" },
    { icon: AlertTriangle, value: "98%", label: "AI Detection Accuracy" },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="text-center p-6 rounded-2xl bg-card/30 border border-border/50"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
            <stat.icon className="w-6 h-6 text-primary" />
          </div>
          <CountUp value={stat.value} isInView={isInView} />
          <p className="text-muted-foreground text-sm mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}

function CountUp({ value, isInView }: { value: string; isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState("0")
  const numericValue = Number.parseInt(value.replace(/[^0-9]/g, ""))
  const suffix = value.replace(/[0-9]/g, "")

  useEffect(() => {
    if (!isInView) return

    let start = 0
    const end = numericValue
    const duration = 2000
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start) + suffix)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, numericValue, suffix, value])

  return <p className="text-3xl md:text-4xl font-bold text-foreground">{displayValue}</p>
}

export function HowItWorksSection() {
  const sections = [
    {
      id: "scanner",
      title: "AI-Powered Analysis",
      subtitle: "The AI Magic",
      description:
        "Our advanced AI scans your e-waste to detect toxic materials and estimate recycling value instantly.",
      icon: Scan,
      component: <AIScannerSection />,
    },
    {
      id: "map",
      title: "Real-Time Impact Map",
      subtitle: "Track Your Impact",
      description: "See live recycling activity in your area and track the collective environmental impact.",
      icon: MapPin,
      component: <ImpactMapSection />,
    },
    {
      id: "categories",
      title: "Categorized Discovery",
      subtitle: "Browse Categories",
      description: "Explore different e-waste categories and discover current market prices.",
      icon: Grid3X3,
      component: <CategoriesSection />,
    },
    {
      id: "stats",
      title: "Trust & Impact",
      subtitle: "Our Numbers",
      description: "Real metrics that showcase our commitment to responsible e-waste management.",
      icon: TrendingUp,
      component: <StatsSection />,
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">How It Works</span>
          <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            The Journey of Your E-Waste
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            From analysis to impact, see how ReNova transforms electronic waste into sustainable value.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        {sections.map((section) => (
          <div key={section.id} className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-primary text-sm font-medium tracking-wide uppercase">
                    {section.subtitle}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{section.title}</h3>
                <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{section.description}</p>
              </motion.div>

              {section.component}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
