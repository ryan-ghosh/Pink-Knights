"use client"

import { AiOrb } from "./ai-orb"

interface MatchmakerHeaderProps {
  name: string
  isSpeaking?: boolean
  isListening?: boolean
}

export function MatchmakerHeader({ name, isSpeaking = false, isListening = false }: MatchmakerHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 pt-4 pb-4">
      <AiOrb
        size="md"
        isSpeaking={isSpeaking}
        isListening={isListening}
      />
      <div className="text-center mt-1">
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">your matchmaker</p>
      </div>
    </div>
  )
}
