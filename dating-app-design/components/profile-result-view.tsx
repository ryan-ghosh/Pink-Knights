"use client"

import { useState } from "react"
import Image from "next/image"
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Ban,
  X,
  Plus,
  Pencil,
  Check,
} from "lucide-react"

const MAX_TAGS = 10

const DEFAULT_TAGS = [
  "Smoking",
  "Dishonesty",
  "No ambition",
  "Poor communication",
  "Closed-minded",
]

interface ProfileResultViewProps {
  onContinue: () => void
}

export function ProfileResultView({ onContinue }: ProfileResultViewProps) {
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS)
  const [isEditing, setIsEditing] = useState(false)
  const [newTag, setNewTag] = useState("")

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      setTags((prev) => [...prev, trimmed])
      setNewTag("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
        {/* Profile card */}
        <div className="animate-fade-in-up">
          {/* Photo */}
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden mb-5">
            <Image
              src="/images/matchmaker.jpg"
              alt="Your profile photo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <h2 className="text-3xl font-serif text-white">Jessica, 28</h2>
              <p className="text-white/70 text-sm mt-1">Your profile is ready</p>
            </div>
            {/* Add photo button */}
            <button
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm border border-primary-foreground/20 shadow-lg shadow-primary/30 transition-all duration-200 hover:bg-primary hover:scale-105 active:scale-95"
              aria-label="Add photo"
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-3 mb-8">
            <div className="glass-strong rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400/15">
                <MapPin className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm text-foreground">San Francisco, CA</p>
              </div>
            </div>
            <div className="glass-strong rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/15">
                <Briefcase className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Career</p>
                <p className="text-sm text-foreground">Product Designer at Figma</p>
              </div>
            </div>
            <div className="glass-strong rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/15">
                <GraduationCap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Education</p>
                <p className="text-sm text-foreground">Stanford University</p>
              </div>
            </div>
          </div>

          {/* Partner preferences */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-medium text-foreground uppercase tracking-wider">
                  Red Flags in a Partner
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 text-xs text-primary transition-colors hover:text-primary/80"
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Done
                  </>
                ) : (
                  <>
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all ${
                    isEditing
                      ? "glass-strong text-foreground pr-2.5"
                      : "glass-light text-foreground/90"
                  }`}
                >
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => removeTag(tag)}
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground/15 hover:bg-destructive/30 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}
              {isEditing && tags.length < MAX_TAGS && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add dealbreaker..."
                    className="h-9 w-28 rounded-full bg-transparent px-3 text-sm text-foreground placeholder:text-foreground/30 glass-light border-0 outline-none focus:ring-1 focus:ring-primary/40"
                  />
                  <button
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full glass-strong text-foreground/70 hover:text-foreground transition-colors disabled:opacity-30"
                    aria-label="Add tag"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {isEditing && (
                <p className="w-full text-xs text-muted-foreground mt-1">
                  {tags.length}/{MAX_TAGS} dealbreakers
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex-shrink-0 px-5 pb-8 pt-4">
        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Start Matching
        </button>
      </div>
    </div>
  )
}
