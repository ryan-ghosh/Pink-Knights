"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AiOrb } from "./ai-orb"
import { Mic, MicOff, ArrowRight } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"

const AI_PROMPTS = [
  "Hey! I'm Hailey, your matchmaker. I'm going to learn a bit about you so I can find your perfect match.",
  "Tell me -- what does your ideal weekend look like?",
  "Great! What's the most important quality you look for in a partner?",
  "Love that. One more -- what's a dealbreaker for you?",
  "Absolutely. Thank you so much. I have a really good sense of who you are now. Let me work my magic.",
]

interface VoiceAgentViewProps {
  onComplete: (voiceTranscript: string) => void
}

export function VoiceAgentView({ onComplete }: VoiceAgentViewProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [showCaption, setShowCaption] = useState("")
  const [userResponses, setUserResponses] = useState<string[]>([])
  const userResponsesRef = useRef<string[]>([])
  
  // Keep ref in sync with state
  useEffect(() => {
    userResponsesRef.current = userResponses
  }, [userResponses])

  // Initialize speech recognition for real voice input
  const {
    transcript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        // Store the final response
        setUserResponses((prev) => [...prev, text.trim()])
        resetTranscript()
      }
    },
    onError: (error) => {
      console.error("Speech recognition error:", error)
    },
  })

  // Start conversation with first prompt - only run once on mount
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    let innerTimeoutId: NodeJS.Timeout
    
    timeoutId = setTimeout(() => {
      if (!mounted) return
      setIsSpeaking(true)
      setShowCaption(AI_PROMPTS[0])
      
      // After AI speaks, wait for user response
      const duration = Math.max(2000, AI_PROMPTS[0].length * 40)
      innerTimeoutId = setTimeout(async () => {
        if (!mounted) return
        setIsSpeaking(false)
        setShowCaption("")
        // Start listening for user response - with a small delay to ensure state is ready
        if (isSupported) {
          setTimeout(() => {
            startListening().catch(err => {
              console.error("Failed to start listening:", err)
            })
          }, 200)
        }
      }, duration)
    }, 1200)
    
    return () => {
      mounted = false
      clearTimeout(timeoutId)
      clearTimeout(innerTimeoutId)
    }
  }, [isSupported, startListening]) // Include these but they're now stable

  // Handle user response submission (when they stop speaking)
  const handleUserResponseComplete = useCallback(() => {
    if (isListening) {
      stopListening()
    }
    
    // Wait a bit for state to settle, then move to next prompt
    setTimeout(() => {
      setCurrentPromptIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        
        // Handle side effects after state update
        setTimeout(() => {
          if (nextIndex >= AI_PROMPTS.length) {
            // All prompts done, combine user responses and complete
            setIsComplete(true)
            const combinedTranscript = userResponsesRef.current.join(" ")
            setTimeout(() => {
              onComplete(combinedTranscript)
            }, 2500)
            return
          }

          // Show next AI prompt
          setIsSpeaking(true)
          setShowCaption(AI_PROMPTS[nextIndex])
          
          // After AI speaks, wait for user response
          const duration = Math.max(2000, AI_PROMPTS[nextIndex].length * 40)
          setTimeout(() => {
            setIsSpeaking(false)
            setShowCaption("")
            // Start listening for user response - with a small delay to ensure state is ready
            if (isSupported) {
              setTimeout(() => {
                startListening().catch(err => {
                  console.error("Failed to start listening:", err)
                })
              }, 200)
            }
          }, duration)
        }, 100) // Small delay to ensure state is updated
        
        return nextIndex
      })
    }, 300) // Wait for stopListening to complete
  }, [isListening, stopListening, onComplete, isSupported, startListening])

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
          {isComplete ? (
            <div className="flex flex-col items-center gap-2 animate-fade-in-up">
              <p className="text-center text-base font-medium text-foreground">
                Thank you
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Building your profile...
              </p>
            </div>
          ) : showCaption ? (
            <p className="text-center text-sm leading-relaxed text-foreground/80 animate-fade-in-up">
              {showCaption}
            </p>
          ) : isListening ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-sm text-foreground/60">
                {transcript || "Listening... Speak now"}
              </p>
              <div className="flex gap-1 items-center mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
              </div>
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:200ms]" />
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 animate-pulse [animation-delay:400ms]" />
            </div>
          )}
        </div>

        {/* Mic button - shows listening state */}
        {!isSupported && (
          <div className="text-center space-y-2">
            <p className="text-xs text-red-500">Voice not supported in this browser</p>
            <p className="text-xs text-muted-foreground">Please use Chrome or Edge</p>
          </div>
        )}
        {speechError && (
          <div className="text-center space-y-2 max-w-xs">
            <p className="text-xs text-red-500 font-medium">{speechError}</p>
            {speechError.includes("permission") && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>To fix this:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-left">
                  <li>Click the lock icon in your browser's address bar</li>
                  <li>Find "Microphone" and set it to "Allow"</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </div>
            )}
          </div>
        )}
        <button
          onClick={isListening ? handleUserResponseComplete : startListening}
          disabled={!isSupported || isComplete}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
            isListening
              ? "bg-primary/30 border border-primary/50 shadow-lg shadow-primary/20"
              : "glass-strong hover:bg-foreground/10"
          } disabled:opacity-50`}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening ? (
            <Mic className="h-5 w-5 text-primary" />
          ) : (
            <MicOff className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Skip button - bottom right */}
      {!isComplete && (
        <button
          onClick={() => {
            const combinedTranscript = userResponses.join(" ")
            onComplete(combinedTranscript)
          }}
          className="absolute bottom-8 right-6 z-20 flex items-center gap-2 rounded-full glass-strong px-5 py-2.5 text-sm font-medium text-foreground/80 transition-all duration-200 hover:text-foreground hover:bg-foreground/10"
        >
          Skip
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
