"use client"

import { useEffect, useState } from "react"

interface AiOrbProps {
  isListening?: boolean
  isSpeaking?: boolean
  size?: "sm" | "md" | "lg"
}

export function AiOrb({ isListening = false, isSpeaking = false, size = "md" }: AiOrbProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const glowSizes = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-52 h-52",
  }

  const innerSizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow */}
      <div
        className={`absolute ${glowSizes[size]} rounded-full transition-all duration-1000 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${isSpeaking ? "ai-orb-glow-speaking" : isListening ? "ai-orb-glow-listening" : "ai-orb-glow-idle"}`}
      />

      {/* Mid glow ring */}
      <div
        className={`absolute ${sizeClasses[size]} rounded-full transition-all duration-700 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
        } ${isSpeaking ? "ai-orb-ring-speaking" : isListening ? "ai-orb-ring-listening" : "ai-orb-ring-idle"}`}
      />

      {/* Core orb */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full transition-all duration-500 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
        } ${isSpeaking ? "ai-orb-core-speaking" : isListening ? "ai-orb-core-listening" : "ai-orb-core-idle"}`}
      >
        {/* Inner bright spot */}
        <div
          className={`absolute inset-0 m-auto ${innerSizes[size]} rounded-full ${
            isSpeaking ? "ai-orb-inner-speaking" : isListening ? "ai-orb-inner-listening" : "ai-orb-inner-idle"
          }`}
        />

        {/* Sheen highlight */}
        <div className="absolute top-[15%] left-[20%] w-[30%] h-[20%] rounded-full bg-white/20 blur-sm" />
      </div>
    </div>
  )
}
