"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

function DigitalEarth() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      targetX: number
      targetY: number
      isConverted: boolean
      angle: number
      orbitRadius: number
      orbitSpeed: number
    }> = []

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const earthRadius = 120

    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = earthRadius + 100 + Math.random() * 200
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? "#f97316" : "#ef4444",
        targetX: centerX + Math.cos(angle) * earthRadius * 0.8,
        targetY: centerY + Math.sin(angle) * earthRadius * 0.8,
        isConverted: false,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: earthRadius + 20 + Math.random() * 30,
        orbitSpeed: 0.005 + Math.random() * 0.01,
      })
    }

    const greenDots: Array<{ angle: number; radius: number; speed: number; size: number }> = []
    for (let i = 0; i < 20; i++) {
      greenDots.push({
        angle: (Math.PI * 2 * i) / 20,
        radius: earthRadius + 15 + Math.random() * 25,
        speed: 0.008 + Math.random() * 0.005,
        size: 3 + Math.random() * 3,
      })
    }

    let animationId: number
    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.016

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, earthRadius * 1.5)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.15)")
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.05)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, earthRadius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#0f172a"
      ctx.beginPath()
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)"
      ctx.lineWidth = 1

      for (let i = -2; i <= 2; i++) {
        const y = centerY + i * 30
        const halfWidth = Math.sqrt(earthRadius * earthRadius - i * 30 * (i * 30))
        if (halfWidth > 0) {
          ctx.beginPath()
          ctx.ellipse(centerX, y, halfWidth, 8, 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * i) / 6 + time * 0.1
        ctx.beginPath()
        ctx.ellipse(centerX, centerY, earthRadius * Math.abs(Math.cos(angle)), earthRadius, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      greenDots.forEach((dot) => {
        dot.angle += dot.speed
        const x = centerX + Math.cos(dot.angle) * dot.radius
        const y = centerY + Math.sin(dot.angle) * dot.radius

        ctx.fillStyle = "#10b981"
        ctx.beginPath()
        ctx.arc(x, y, dot.size, 0, Math.PI * 2)
        ctx.fill()

        const glow = ctx.createRadialGradient(x, y, 0, x, y, dot.size * 3)
        glow.addColorStop(0, "rgba(16, 185, 129, 0.5)")
        glow.addColorStop(1, "transparent")
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, dot.size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      particles.forEach((p) => {
        const dx = centerX - p.x
        const dy = centerY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > earthRadius && !p.isConverted) {
          p.x += dx * 0.003
          p.y += dy * 0.003
          p.vx *= 0.98
          p.vy *= 0.98
          p.x += p.vx
          p.y += p.vy

          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()

          ctx.strokeStyle = p.color + "40"
          ctx.lineWidth = p.size / 2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - dx * 0.05, p.y - dy * 0.05)
          ctx.stroke()
        } else if (!p.isConverted) {
          p.isConverted = true
          p.color = "#10b981"
        }

        if (p.isConverted) {
          p.angle += p.orbitSpeed
          p.x = centerX + Math.cos(p.angle) * p.orbitRadius
          p.y = centerY + Math.sin(p.angle) * p.orbitRadius

          ctx.fillStyle = "#10b981"
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      className="w-full max-w-[500px] h-auto"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }}
    />
  )
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/95" />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgb(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgb(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
      >
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary tracking-wide">AI-Powered E-Waste Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
          >
            <span className="text-foreground">Your Tech Trash,</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Our Digital Future.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Analyze toxicity, track impact, and trade e-waste with AI-powered precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium rounded-xl shadow-lg shadow-primary/25"
                >
                  Sell E-Waste
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/marketplace">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary hover:text-foreground px-8 py-6 text-lg font-medium rounded-xl bg-transparent"
                >
                  Explore Marketplace
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 flex justify-center"
        >
          <DigitalEarth />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
