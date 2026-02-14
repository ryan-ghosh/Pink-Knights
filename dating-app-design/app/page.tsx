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

type AppPhase = "signup" | "voice-agent" | "profile-result" | "app"

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("signup")
  const [activeTab, setActiveTab] = useState("matches")

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
            <SignupForm onComplete={() => setPhase("voice-agent")} />
          </div>
        </>
      )}

      {/* Phase: Voice Agent */}
      {phase === "voice-agent" && (
        <div className="relative z-10 flex-1">
          <VoiceAgentView onComplete={() => setPhase("profile-result")} />
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
            <ProfileResultView onContinue={() => setPhase("app")} />
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
