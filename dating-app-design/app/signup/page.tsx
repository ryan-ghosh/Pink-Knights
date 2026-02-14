"use client"

import Image from "next/image"
import { SignupForm } from "@/components/signup/signup-form"

export default function SignupPage() {
  return (
    <div className="relative flex flex-col h-dvh max-w-md mx-auto overflow-hidden">
      {/* Holographic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/sky-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background/60" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-4">
        <h1 className="text-3xl font-serif italic tracking-wide text-foreground">
          DUET
        </h1>
      </div>

      {/* Form */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <SignupForm />
      </div>
    </div>
  )
}
