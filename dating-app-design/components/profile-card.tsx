"use client"

import Image from "next/image"
import { ChevronRight, MapPin, Briefcase, GraduationCap, Grid3X3 } from "lucide-react"

interface ProfileCardProps {
  name: string
  age: number
  height: string
  location: string
  job: string
  education: string
  photoUrl: string
  photoCount: number
  onViewProfile?: () => void
}

export function ProfileCard({
  name,
  age,
  height,
  location,
  job,
  education,
  photoUrl,
  photoCount,
  onViewProfile,
}: ProfileCardProps) {
  return (
    <div className="animate-fade-in-up">
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="flex">
          <div className="relative w-[55%] aspect-[3/4]">
            <Image
              src={photoUrl}
              alt={`Photo of ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 55vw, 250px"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">
                  {age} &middot; {height}
                </p>
              </div>
              <button
                onClick={onViewProfile}
                className="w-8 h-8 rounded-full glass flex items-center justify-center"
                aria-label={`View ${name}'s full profile`}
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-2 text-sm text-foreground/90">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400" />
                <span>{location}</span>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                <span>{job}</span>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
                <span>{education}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 px-1">
        <Grid3X3 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{photoCount} Photos</span>
      </div>
    </div>
  )
}
