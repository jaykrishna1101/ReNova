"use client"

import { motion } from "framer-motion"
import { Cpu, Monitor, Smartphone, HardDrive, Battery, Wifi, CircuitBoard, Laptop } from "lucide-react"

const floatingIcons = [
  { Icon: Cpu, delay: 0, x: "10%", y: "15%" },
  { Icon: Monitor, delay: 0.2, x: "85%", y: "20%" },
  { Icon: Smartphone, delay: 0.4, x: "15%", y: "75%" },
  { Icon: HardDrive, delay: 0.6, x: "80%", y: "70%" },
  { Icon: Battery, delay: 0.8, x: "5%", y: "45%" },
  { Icon: Wifi, delay: 1.0, x: "90%", y: "45%" },
  { Icon: CircuitBoard, delay: 1.2, x: "25%", y: "90%" },
  { Icon: Laptop, delay: 1.4, x: "70%", y: "85%" },
]

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map(({ Icon, delay, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.15, 0.15, 0],
            scale: [0.5, 1, 1, 0.5],
            y: [0, -20, -20, 0],
          }}
          transition={{
            duration: 8,
            delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-8 h-8 text-primary/40" />
        </motion.div>
      ))}
    </div>
  )
}
