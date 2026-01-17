"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Leaf, Package } from "lucide-react"

const stats = [
  { icon: TrendingUp, label: "E-waste diverted", value: "50K+ tons" },
  { icon: Users, label: "Active users", value: "25K+" },
  { icon: Leaf, label: "CO₂ saved", value: "120K tons" },
  { icon: Package, label: "Items recycled", value: "1M+" },
]

export function AnimatedStats() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="flex items-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <stat.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
