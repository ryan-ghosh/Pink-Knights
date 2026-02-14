"use client"

/**
 * EXAMPLE: Signup Form with Voice-to-Text Integration
 * 
 * This is an example showing how to integrate Web Speech API with your form
 * and send both form_data and voice_transcript to Lambda.
 * 
 * Key features:
 * 1. Voice recording using Web Speech API (free, no backend needed)
 * 2. Real-time transcription display
 * 3. Sending clean JSON payload to Lambda with both form_data and voice_transcript
 */

import { useState } from "react"
import { ArrowLeft, ArrowRight, Mic, MicOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { sendToBackend } from "@/lib/lambda-client"

interface FormData {
  firstName: string
  age: string
  location: string
  // ... add other fields as needed
}

export function SignupFormWithVoice() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    age: "",
    location: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // Initialize speech recognition
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
      // Optional: Auto-fill form fields based on voice input
      // You can add NLP logic here to extract structured data
      console.log("Voice transcript:", text, "Final:", isFinal)
    },
    onError: (error) => {
      console.error("Speech recognition error:", error)
    },
  })

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.age) {
      alert("Please fill in required fields")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Send both form_data and voice_transcript to backend
      // Uses Next.js API route by default, or Lambda URL from env variable
      const result = await sendToBackend(
        formData,
        transcript.trim() // Send the final voice transcript
      )

      if (result.success) {
        setSubmitStatus("success")
        console.log("Successfully sent to backend:", result.data)
        // Reset form and transcript
        setFormData({ firstName: "", age: "", location: "" })
        resetTranscript()
      } else {
        setSubmitStatus("error")
        console.error("Failed to send to backend:", result.message)
      }
    } catch (error) {
      setSubmitStatus("error")
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Signup with Voice</h2>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Enter your name or speak it"
          />
        </div>

        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
            placeholder="Enter your age"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Enter your location"
          />
        </div>
      </div>

      {/* Voice Recording Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label>Voice Input</Label>
          {!isSupported && (
            <span className="text-sm text-red-500">
              Voice not supported in this browser
            </span>
          )}
        </div>

        {/* Voice Transcript Display */}
        <div className="min-h-[100px] p-3 bg-muted rounded-md">
          {transcript ? (
            <p className="text-sm">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isListening
                ? "Listening... Speak now"
                : "Click the microphone to start voice input"}
            </p>
          )}
        </div>

        {/* Microphone Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={!isSupported}
            variant={isListening ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Recording
              </>
            )}
          </Button>

          {transcript && (
            <Button
              type="button"
              onClick={resetTranscript}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          )}
        </div>

        {speechError && (
          <p className="text-sm text-red-500">{speechError}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !formData.firstName || !formData.age}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit to Lambda"}
      </Button>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <p className="text-sm text-green-500 text-center">
          Successfully sent to backend!
        </p>
      )}
      {submitStatus === "error" && (
        <p className="text-sm text-red-500 text-center">
          Failed to send to backend. Check console for details.
        </p>
      )}

      {/* Debug Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
        <p>Voice Transcript: {transcript || "(empty)"}</p>
      </div>
    </div>
  )
}
