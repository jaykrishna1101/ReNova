"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface AnimatedRobotProps {
  isPasswordFocused?: boolean
}

export function AnimatedRobot({ isPasswordFocused = false }: AnimatedRobotProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  // Spring physics for smooth eye movement
  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 }
  const eyeX = useSpring(0, springConfig)
  const eyeY = useSpring(0, springConfig)

  // Transform mouse position to eye movement range
  const leftPupilX = useTransform(eyeX, [-1, 1], [-8, 8])
  const leftPupilY = useTransform(eyeY, [-1, 1], [-5, 5])
  const rightPupilX = useTransform(eyeX, [-1, 1], [-8, 8])
  const rightPupilY = useTransform(eyeY, [-1, 1], [-5, 5])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to viewport center
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePosition({ x, y })
      eyeX.set(x)
      eyeY.set(y)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [eyeX, eyeY])

  return (
    <div className="relative w-full mx-auto flex items-center justify-center">
      <svg viewBox="0 0 280 220" className="w-full max-w-[400px] h-auto">
        {/* Robot Body - pointing right */}
        <motion.g>
          {/* Body base */}
          <motion.rect
            x="50"
            y="140"
            width="100"
            height="60"
            rx="10"
            fill="#0d9488"
            initial={{ y: 145 }}
            animate={{ y: [140, 142, 140] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Body highlight */}
          <rect x="60" y="150" width="80" height="8" rx="4" fill="#14b8a6" opacity="0.6" />
          <rect x="70" y="165" width="60" height="4" rx="2" fill="#14b8a6" opacity="0.4" />
          <rect x="70" y="175" width="60" height="4" rx="2" fill="#14b8a6" opacity="0.4" />

          {/* Neck */}
          <rect x="85" y="120" width="30" height="25" rx="5" fill="#5eead4" />
          <rect x="90" y="125" width="20" height="5" rx="2" fill="#2dd4bf" />

          {/* Head */}
          <motion.g
            animate={{
              rotate: isPasswordFocused ? 0 : mousePosition.x * 3,
              y: isPasswordFocused ? 0 : mousePosition.y * 2,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            style={{ originX: "100px", originY: "80px" }}
          >
            {/* Head base */}
            <rect x="45" y="30" width="110" height="95" rx="20" fill="#0d9488" />

            {/* Head top highlight */}
            <rect x="55" y="35" width="90" height="10" rx="5" fill="#14b8a6" opacity="0.5" />

            {/* Face plate */}
            <rect x="55" y="50" width="90" height="65" rx="12" fill="#0f766e" />

            {/* Eyes container */}
            <g>
              {/* Left eye white */}
              <ellipse cx="80" cy="75" rx="18" ry="20" fill="#f0fdfa" />
              {/* Right eye white */}
              <ellipse cx="120" cy="75" rx="18" ry="20" fill="#f0fdfa" />

              {/* Animated pupils - only show when not password focused */}
              {!isPasswordFocused && (
                <>
                  <motion.ellipse
                    cx="80"
                    cy="75"
                    rx="8"
                    ry="10"
                    fill="#0d9488"
                    style={{ x: leftPupilX, y: leftPupilY }}
                  />
                  <motion.ellipse
                    cx="80"
                    cy="72"
                    rx="3"
                    ry="4"
                    fill="#5eead4"
                    style={{ x: leftPupilX, y: leftPupilY }}
                  />
                  <motion.ellipse
                    cx="120"
                    cy="75"
                    rx="8"
                    ry="10"
                    fill="#0d9488"
                    style={{ x: rightPupilX, y: rightPupilY }}
                  />
                  <motion.ellipse
                    cx="120"
                    cy="72"
                    rx="3"
                    ry="4"
                    fill="#5eead4"
                    style={{ x: rightPupilX, y: rightPupilY }}
                  />
                </>
              )}

              {/* Closed eyes - show when password focused */}
              {isPasswordFocused && (
                <>
                  <motion.line
                    x1="65"
                    y1="75"
                    x2="95"
                    y2="75"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.line
                    x1="105"
                    y1="75"
                    x2="135"
                    y2="75"
                    stroke="#0d9488"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </>
              )}
            </g>

            {/* Mouth */}
            <motion.path
              d={isPasswordFocused ? "M 85 100 Q 100 105 115 100" : "M 85 100 Q 100 112 115 100"}
              stroke="#14b8a6"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isPasswordFocused ? "M 85 100 Q 100 105 115 100" : "M 85 100 Q 100 112 115 100",
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Antenna */}
            <motion.g
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              style={{ originX: "100px", originY: "30px" }}
            >
              <rect x="95" y="10" width="10" height="25" rx="3" fill="#5eead4" />
              <motion.circle
                cx="100"
                cy="8"
                r="8"
                fill="#14b8a6"
                animate={{
                  fill: ["#14b8a6", "#2dd4bf", "#14b8a6"],
                }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
            </motion.g>

            {/* Ear lights */}
            <motion.circle
              cx="45"
              cy="70"
              r="6"
              fill="#2dd4bf"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.circle
              cx="155"
              cy="70"
              r="6"
              fill="#2dd4bf"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.75 }}
            />
          </motion.g>

          {/* Left arm - stays normal */}
          <motion.g
            animate={isPasswordFocused ? { rotate: -50, x: 15, y: -30 } : { rotate: 0, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{ originX: "50px", originY: "150px" }}
          >
            <rect x="20" y="145" width="35" height="15" rx="7" fill="#5eead4" />
            <circle cx="20" cy="152" r="10" fill="#14b8a6" />
            <motion.g
              animate={isPasswordFocused ? { rotate: 30 } : { rotate: 0 }}
              style={{ originX: "20px", originY: "152px" }}
            >
              <ellipse cx="12" cy="152" rx="8" ry="10" fill="#0d9488" />
            </motion.g>
          </motion.g>

          <motion.g
            animate={
              isPasswordFocused
                ? { rotate: 50, x: -15, y: -30 }
                : { rotate: [-15, -20, -15], x: [0, 5, 0], y: [0, -2, 0] }
            }
            transition={
              isPasswordFocused
                ? { type: "spring", stiffness: 200, damping: 15 }
                : { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
            }
            style={{ originX: "150px", originY: "150px" }}
          >
            {/* Upper arm */}
            <rect x="145" y="145" width="45" height="15" rx="7" fill="#5eead4" />
            {/* Elbow joint */}
            <circle cx="190" cy="152" r="10" fill="#14b8a6" />
            {/* Forearm pointing right */}
            <rect x="195" y="145" width="40" height="15" rx="7" fill="#5eead4" />
            {/* Wrist */}
            <circle cx="235" cy="152" r="8" fill="#14b8a6" />
            {/* Pointing hand */}
            <motion.g
              animate={isPasswordFocused ? { rotate: -30 } : { rotate: 0 }}
              style={{ originX: "235px", originY: "152px" }}
            >
              {/* Hand palm */}
              <ellipse cx="248" cy="152" rx="10" ry="12" fill="#0d9488" />
              {/* Pointing finger */}
              <motion.rect
                x="255"
                y="148"
                width="20"
                height="8"
                rx="4"
                fill="#0d9488"
                animate={isPasswordFocused ? { width: 8 } : { width: [18, 22, 18] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              {/* Finger tip */}
              <motion.circle
                cx="275"
                cy="152"
                r="4"
                fill="#14b8a6"
                animate={isPasswordFocused ? { cx: 263, opacity: 0 } : { cx: [273, 277, 273], opacity: 1 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.g>
          </motion.g>
        </motion.g>
      </svg>

      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-teal-200 rounded-full px-4 py-2 shadow-lg"
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          className="text-sm text-teal-700 whitespace-nowrap font-medium"
          key={isPasswordFocused ? "hidden" : "visible"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isPasswordFocused ? "I promise I'm not looking!" : "Hi! I'm Nova"}
        </motion.p>
      </motion.div>
    </div>
  )
}
