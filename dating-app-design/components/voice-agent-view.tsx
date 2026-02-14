"use client"

import { useState, useEffect, useCallback } from "react"
import { AiOrb } from "./ai-orb"
import { Mic, MicOff, ArrowRight } from "lucide-react"

const CONVERSATION_SCRIPT = [
  { speaker: "ai", text: "Hey! I'm Hailey, your matchmaker. I'm going to learn a bit about you so I can find your perfect match." },
  { speaker: "ai", text: "Tell me -- what does your ideal weekend look like?" },
  { speaker: "user", text: "I love going to brunch, exploring new coffee shops, and maybe a hike if the weather is nice." },
  { speaker: "ai", text: "Great taste. You sound like someone who values both adventure and relaxation." },
  { speaker: "ai", text: "What's the most important quality you look for in a partner?" },
  { speaker: "user", text: "Someone who's ambitious but still knows how to have fun and not take themselves too seriously." },
  { speaker: "ai", text: "Love that. The balance between drive and playfulness is rare but so important." },
  { speaker: "ai", text: "One more -- what's a dealbreaker for you?" },
  { speaker: "user", text: "Someone who isn't honest or doesn't communicate well." },
  { speaker: "ai", text: "Absolutely. Transparency is everything." },
  { speaker: "ai", text: "Thank you so much. I have a really good sense of who you are now. Let me work my magic." },
]

interface VoiceAgentViewProps {
  onComplete: () => void
}

export function VoiceAgentView({ onComplete }: VoiceAgentViewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [visibleMessages, setVisibleMessages] = useState<typeof CONVERSATION_SCRIPT>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMicActive, setIsMicActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showCaption, setShowCaption] = useState("")

  const advanceConversation = useCallback(() => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= CONVERSATION_SCRIPT.length) {
      setIsSpeaking(false)
      setIsListening(false)
      setIsComplete(true)
      setTimeout(() => onComplete(), 2500)
      return
    }

    const msg = CONVERSATION_SCRIPT[nextIndex]
    setCurrentIndex(nextIndex)

    if (msg.speaker === "ai") {
      setIsListening(false)
      setIsSpeaking(true)
      setShowCaption(msg.text)
      setVisibleMessages((prev) => [...prev, msg])

      const duration = Math.max(2000, msg.text.length * 40)
      setTimeout(() => {
        setIsSpeaking(false)
        // Check if next message is user or ai
        const next = CONVERSATION_SCRIPT[nextIndex + 1]
        if (next && next.speaker === "user") {
          setIsListening(true)
          setShowCaption("")
        }
      }, duration)
    } else {
      // User "speaking"
      setIsSpeaking(false)
      setIsListening(true)
      setIsMicActive(true)
      setShowCaption(msg.text)
      setVisibleMessages((prev) => [...prev, msg])

      const duration = Math.max(1800, msg.text.length * 35)
      setTimeout(() => {
        setIsListening(false)
        setIsMicActive(false)
        setShowCaption("")
      }, duration)
    }
  }, [currentIndex, onComplete])

  // Start conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      advanceConversation()
    }, 1200)
    return () => clearTimeout(timer)
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-advance after state changes
  useEffect(() => {
    if (currentIndex < 0) return
    if (isComplete) return

    const msg = CONVERSATION_SCRIPT[currentIndex]
    if (!msg) return

    const duration = msg.speaker === "ai"
      ? Math.max(2000, msg.text.length * 40) + 800
      : Math.max(1800, msg.text.length * 35) + 600

    const timer = setTimeout(() => {
      advanceConversation()
    }, duration)

    return () => clearTimeout(timer)
  }, [currentIndex, advanceConversation, isComplete])

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative">
      {/* Dark glassmorphism backdrop */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Orb container with extra glow */}
        <div className="relative">
          {/* Ambient background glow */}
          <div
            className={`absolute -inset-16 rounded-full transition-all duration-1000 ${
              isSpeaking
                ? "bg-purple-500/10 blur-3xl scale-110"
                : isListening
                  ? "bg-purple-500/8 blur-3xl scale-105"
                  : "bg-purple-500/5 blur-3xl scale-100"
            }`}
          />
          <AiOrb isListening={isListening} isSpeaking={isSpeaking} size="lg" />
        </div>

        {/* Name & role */}
        <div className="text-center">
          <h2 className="text-xl font-medium text-foreground">Hailey</h2>
          <p className="text-sm text-muted-foreground mt-0.5">your matchmaker</p>
        </div>

        {/* Live caption area */}
        <div className="h-24 flex items-center justify-center w-full max-w-xs">
          {showCaption && !isComplete ? (
            <p
              key={currentIndex}
              className="text-center text-sm leading-relaxed text-foreground/80 animate-fade-in-up"
            >
              {showCaption}
            </p>
          ) : isComplete ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in-up">
              <p className="text-center text-base font-medium text-foreground">
                Thank you
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Building your profile...
              </p>
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:200ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:400ms]" />
            </div>
          )}
        </div>

        {/* Mic button */}
        <button
          onClick={() => setIsMicActive((prev) => !prev)}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            isMicActive
              ? "bg-primary/30 border border-primary/50 shadow-lg shadow-primary/20"
              : "glass-strong hover:bg-foreground/10"
          }`}
          aria-label={isMicActive ? "Microphone active" : "Tap to speak"}
        >
          {isMicActive ? (
            <Mic className="h-5 w-5 text-primary" />
          ) : (
            <MicOff className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Next button - bottom right */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-6 z-20 flex items-center gap-2 rounded-full glass-strong px-5 py-2.5 text-sm font-medium text-foreground/80 transition-all duration-200 hover:text-foreground hover:bg-foreground/10"
      >
        Next
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
