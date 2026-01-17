"use client"

import { motion } from "framer-motion"
import { Recycle } from "lucide-react"

interface VoxNovaLogoProps {
  className?: string
  showText?: boolean
}

export function VoxNovaLogo({ className = "", showText = true }: VoxNovaLogoProps) {
  return (
    <motion.div
      className={`flex items-center gap-2.5 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary"
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <Recycle className="w-5 h-5 text-primary-foreground" />
      </motion.div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-foreground">
            Re<span className="text-primary">Nova</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-1">E-Waste Solutions</span>
        </div>
      )}
    </motion.div>
  )
}
