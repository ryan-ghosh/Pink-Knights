"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: SpeechRecognitionErrorEvent) => void
}

interface SpeechRecognitionState {
  transcript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
}

/**
 * Custom hook for Web Speech API (SpeechRecognition)
 * 
 * Features:
 * - Completely free (browser-native)
 * - No backend required
 * - Real-time transcription
 * - Works in Chrome, Edge, Safari (with polyfill)
 * 
 * Usage:
 * ```tsx
 * const { transcript, isListening, startListening, stopListening } = useSpeechRecognition({
 *   onResult: (text, isFinal) => {
 *     console.log('Transcript:', text, 'Final:', isFinal)
 *   }
 * })
 * ```
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    lang = "en-US",
    onResult,
    onError,
  } = options

  const [state, setState] = useState<SpeechRecognitionState>({
    transcript: "",
    isListening: false,
    isSupported: false,
    error: null,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef<string>("")
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const isListeningRef = useRef(false)

  // Keep callbacks in refs to avoid recreating effect
  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  // Keep isListening in sync with ref
  useEffect(() => {
    isListeningRef.current = state.isListening
  }, [state.isListening])

  // Check for browser support - only run once
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: "Speech recognition is not supported in this browser",
      }))
      return
    }

    setState((prev) => {
      if (prev.isSupported) return prev // Avoid unnecessary update
      return { ...prev, isSupported: true }
    })

    // Initialize recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = lang

    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }

      // Update final transcript
      if (finalTranscript) {
        // CRITICAL FIX: Only pass the NEW final transcript, not the accumulated one
        // The accumulated ref is for display, but onResult should get only the new segment
        finalTranscriptRef.current += finalTranscript
        setState((prev) => ({
          ...prev,
          transcript: finalTranscriptRef.current + interimTranscript,
        }))
        // Pass only the NEW final transcript segment, not the entire accumulated transcript
        onResultRef.current?.(finalTranscript.trim(), true)
      } else if (interimTranscript) {
        setState((prev) => ({
          ...prev,
          transcript: finalTranscriptRef.current + interimTranscript,
        }))
        // For interim results, pass the current display transcript
        onResultRef.current?.(finalTranscriptRef.current + interimTranscript, false)
      }
    }

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "An error occurred"
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected"
          break
        case "audio-capture":
          errorMessage = "No microphone found"
          break
        case "not-allowed":
          errorMessage = "Microphone permission denied"
          break
        case "network":
          errorMessage = "Network error"
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }))

      onErrorRef.current?.(event)
    }

    // Handle end
    recognition.onend = () => {
      // Reset ref first, then state
      isListeningRef.current = false
      setState((prev) => ({ ...prev, isListening: false }))
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, lang]) // Removed onResult and onError from deps

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setState((prev) => ({
        ...prev,
        error: "Speech recognition not initialized",
        isListening: false,
      }))
      return
    }

    // If already listening according to our ref, don't start again
    // Check ref first (faster), then double-check with a small delay if needed
    if (isListeningRef.current) {
      console.log("Already listening (ref check), skipping start")
      return
    }

    // Request microphone permission first
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    } catch (permissionError) {
      setState((prev) => ({
        ...prev,
        error: "Microphone permission denied. Please allow microphone access in your browser settings.",
        isListening: false,
      }))
      return
    }

    try {
      // Always stop first to ensure clean state, even if we think it's not running
      try {
        recognitionRef.current.stop()
        // Wait for the stop to complete
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (e) {
        // Ignore errors from stopping (might not be running, which is fine)
        console.log("Stop error (expected if not running):", e)
      }

      // Double-check state before starting
      if (isListeningRef.current) {
        console.log("Still listening after stop, aborting start")
        return
      }

      finalTranscriptRef.current = ""
      isListeningRef.current = true // Set ref first to prevent double-start
      setState((prev) => ({
        ...prev,
        transcript: "",
        isListening: true,
        error: null,
      }))
      
      recognitionRef.current.start()
    } catch (error: any) {
      console.error("Speech recognition start error:", error)
      
      // Reset state on error
      isListeningRef.current = false
      setState((prev) => ({
        ...prev,
        error: error?.message?.includes("already started") 
          ? "Speech recognition is already running. Please wait a moment."
          : "Failed to start speech recognition. Click the microphone button to try again.",
        isListening: false,
      }))
    }
  }, []) // No dependencies - uses refs and state setters

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    
    // Always try to stop, even if ref says we're not listening
    // (the API might be in a different state)
    try {
      recognitionRef.current.stop()
      isListeningRef.current = false
      setState((prev) => ({ ...prev, isListening: false }))
    } catch (error) {
      // Even if stop fails, reset our state
      isListeningRef.current = false
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: "Failed to stop speech recognition",
      }))
    }
  }, []) // No dependencies - uses refs

  const reset = useCallback(() => {
    finalTranscriptRef.current = ""
    setState((prev) => ({
      ...prev,
      transcript: "",
      error: null,
    }))
  }, [])

  return {
    transcript: state.transcript,
    isListening: state.isListening,
    isSupported: state.isSupported,
    error: state.error,
    startListening,
    stopListening,
    reset,
  }
}

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}
