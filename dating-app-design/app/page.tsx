"use client"

import { useState } from "react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { DateSetupsView } from "@/components/date-setups-view"
import { SetupsView } from "@/components/setups-view"
import { ProfileView } from "@/components/profile-view"
import { SignupForm } from "@/components/signup/signup-form"
import { VoiceAgentView } from "@/components/voice-agent-view"
import { ProfileResultView } from "@/components/profile-result-view"
import { sendToBackend } from "@/lib/lambda-client"

type AppPhase = "signup" | "voice-agent" | "profile-result" | "app"

interface FormData {
  firstName: string
  age: string
  gender: string
  orientation: string
  location: string
  height: string
  ethnicity: string
  religion: string
  hometown: string
  lookingFor: string
  education: string
  jobTitle: string
  employer: string
  smoking: string
  drinking: string
  marijuana: string
  otherDrugs: string
  politics: string
  religionImportance: string
  wantChildren: string
  haveChildren: string
}

interface ApiResponse {
  score: number
  summary: string
  candidate_profile?: string
  meta?: {
    compatibility_factors?: Record<string, string>
    potential_concerns?: string
    candidate_profile?: string
  }
}

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("signup")
  const [activeTab, setActiveTab] = useState("matches")
  const [formData, setFormData] = useState<FormData | null>(null)
  const [voiceTranscript, setVoiceTranscript] = useState<string>("")
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Handle form completion - store form data and move to voice agent
  const handleFormComplete = (data: FormData) => {
    setFormData(data)
    setPhase("voice-agent")
  }

  // Handle voice agent completion - store transcript and send to API
  const handleVoiceComplete = async (transcript: string) => {
    // Validate transcript is not empty or just whitespace
    const trimmedTranscript = transcript?.trim() || ""
    
    console.log("\n" + "=".repeat(80))
    console.log("🎯 FRONTEND: Voice Complete Handler Called")
    console.log("=".repeat(80))
    console.log("📋 Received transcript length:", trimmedTranscript.length)
    console.log("📋 Received transcript:", `"${trimmedTranscript.substring(0, 200)}${trimmedTranscript.length > 200 ? '...' : ''}"`)
    console.log("📋 Form Data exists:", !!formData)
    console.log("📋 Form Data keys:", formData ? Object.keys(formData).length : 0)
    console.log("=".repeat(80) + "\n")
    
    setVoiceTranscript(trimmedTranscript)
    
    if (!formData) {
      console.error("❌ Form data not available")
      setSubmitError("Form data is missing")
      return
    }

    // Print what we're about to send
    console.log("\n" + "=".repeat(80))
    console.log("🎯 FRONTEND: About to send data to Lambda")
    console.log("=".repeat(80))
    console.log("📋 Form Data:", JSON.stringify(formData, null, 2))
    console.log("🎤 Voice Transcript:", trimmedTranscript)
    console.log("🎤 Voice Transcript Length:", trimmedTranscript.length)
    console.log("=".repeat(80) + "\n")

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Send form data and voice transcript to API
      // Use trimmed transcript to ensure we're not sending whitespace
      const result = await sendToBackend(formData, trimmedTranscript)

      if (result.success && result.data) {
        // Validate response structure
        const data = result.data as any
        console.log("✅ API Response received:", JSON.stringify(data, null, 2))
        console.log("🔍 Response validation check:", {
          hasData: !!data,
          dataType: typeof data,
          dataKeys: data ? Object.keys(data) : [],
          hasScore: data && 'score' in data,
          scoreValue: data?.score,
          scoreType: typeof data?.score,
          hasSummary: data && 'summary' in data,
          summaryValue: data?.summary ? data.summary.substring(0, 50) + "..." : "empty/falsy",
          summaryType: typeof data?.summary,
          summaryLength: data?.summary?.length || 0
        })
        
        // Check if response has required fields
        // Be more explicit: score must be a number (including 0), summary must be a non-empty string
        const hasValidScore = data && typeof data.score === 'number' && !isNaN(data.score)
        const hasValidSummary = data && typeof data.summary === 'string' && data.summary.trim().length > 0
        
        if (hasValidScore && hasValidSummary) {
          // Check if the response indicates missing profile (score 0 with error message)
          if (data.score === 0 && data.summary.toLowerCase().includes("unable to simulate")) {
            console.error("❌ AI indicates missing profile data:", data.summary.substring(0, 200))
            setSubmitError("Profile data was not received correctly. Please try again.")
            return
          }
          
          // Store the API response
          setApiResponse(data as ApiResponse)
          setPhase("profile-result")
        } else {
          console.error("❌ Invalid API response structure:", data)
          console.error("❌ Response validation details:", {
            hasValidScore,
            hasValidSummary,
            scoreValue: data?.score,
            scoreType: typeof data?.score,
            summaryValue: data?.summary,
            summaryType: typeof data?.summary,
            summaryLength: data?.summary?.length,
            allKeys: data ? Object.keys(data) : []
          })
          console.error("❌ Response keys:", Object.keys(data || {}))
          console.error("❌ Has score:", "score" in (data || {}))
          console.error("❌ Has summary:", "summary" in (data || {}))
          setSubmitError("Invalid response from server. Missing required fields.")
        }
      } else {
        setSubmitError(result.message || "Failed to submit profile")
        console.error("API Error:", result.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setSubmitError(errorMessage)
      console.error("Error submitting to API:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col h-dvh max-w-md mx-auto overflow-hidden">
      {/* iOS 26 Holographic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/sky-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            phase === "voice-agent"
              ? "bg-gradient-to-b from-background/85 via-background/75 to-background/90"
              : "bg-gradient-to-b from-background/70 via-background/50 to-background/75"
          }`}
        />
      </div>

      {/* Phase: Signup */}
      {phase === "signup" && (
        <>
          <div className="relative z-10 flex flex-col items-center pt-14 pb-4">
            <h1 className="text-3xl font-serif italic tracking-wide text-foreground">
              DUET
            </h1>
          </div>
          <div className="relative z-10 flex-1 min-h-0 overflow-hidden">
            <SignupForm onComplete={handleFormComplete} />
          </div>
        </>
      )}

      {/* Phase: Voice Agent */}
      {phase === "voice-agent" && (
        <div className="relative z-10 flex-1">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-foreground/80">Sending your profile...</p>
            </div>
          ) : (
            <VoiceAgentView onComplete={handleVoiceComplete} />
          )}
          {submitError && (
            <div className="absolute bottom-20 left-6 right-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-500">{submitError}</p>
            </div>
          )}
        </div>
      )}

      {/* Phase: Profile Result */}
      {phase === "profile-result" && (
        <>
          <header className="relative z-10 flex items-center justify-center px-5 pt-4 pb-2">
            <h1 className="text-2xl font-serif italic tracking-wide text-foreground">
              DUET
            </h1>
          </header>
          <div className="relative z-10 flex-1 min-h-0 overflow-hidden">
            {apiResponse ? (
              <div className="h-full overflow-y-auto p-6 space-y-4">
                <div className="glass-strong rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-2">Compatibility Score</h2>
                  <p className="text-3xl font-bold text-primary">{apiResponse.score}/100</p>
                </div>
                <div className="glass-strong rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-2">Summary</h2>
                  <p className="text-sm text-foreground/80 leading-relaxed">{apiResponse.summary}</p>
                </div>
                {apiResponse.meta?.compatibility_factors && (
                  <div className="glass-strong rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-2">Compatibility Factors</h2>
                    <ul className="space-y-2 text-sm">
                      {Object.entries(apiResponse.meta.compatibility_factors).map(([key, value]) => (
                        <li key={key}>
                          <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                          <span className="text-foreground/70">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {apiResponse.meta?.potential_concerns && (
                  <div className="glass-strong rounded-xl p-4 border border-yellow-500/30">
                    <h2 className="text-lg font-semibold mb-2 text-yellow-500">Potential Concerns</h2>
                    <p className="text-sm text-foreground/80">{apiResponse.meta.potential_concerns}</p>
                  </div>
                )}
                {apiResponse.candidate_profile && (
                  <div className="glass-strong rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-2">Candidate Profile</h2>
                    <p className="text-sm text-foreground/80 leading-relaxed">{apiResponse.candidate_profile}</p>
                  </div>
                )}
                <button
                  onClick={() => setPhase("app")}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all"
                >
                  Continue to App
                </button>
              </div>
            ) : (
              <ProfileResultView onContinue={() => setPhase("app")} />
            )}
          </div>
        </>
      )}

      {/* Phase: Main App */}
      {phase === "app" && (
        <>
          <header className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2">
            <h1 className="text-2xl font-serif italic tracking-wide text-foreground">
              DUET
            </h1>
            <div className="w-8" />
          </header>
          <main
            className="relative z-10 flex-1 overflow-hidden"
            role="tabpanel"
          >
            {activeTab === "setups" && <DateSetupsView />}
            {activeTab === "matches" && <SetupsView />}
            {activeTab === "profile" && <ProfileView />}
          </main>
          <div className="relative z-10">
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex justify-center pb-2 bg-nav">
              <div className="w-32 h-1 rounded-full bg-foreground/20" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
