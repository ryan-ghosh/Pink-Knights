"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  X,
  Star,
  ChevronRight,
} from "lucide-react"

interface Candidate {
  id: string
  name: string
  age: number
  height: string
  location: string
  job: string
  education: string
  photoUrl: string
  photos: string[]
  compatibility: number
  summary: string
  highlights: string[]
  gender: "male" | "female"
}

interface FormData {
  gender?: string
  orientation?: string
}

interface ApiResponse {
  score?: number
  summary?: string
  meta?: {
    candidate_profile?: string
  }
}

const CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Dan",
    age: 32,
    height: "6'1\"",
    location: "Williamsburg",
    job: "VP at Morgan Stanley",
    education: "Harvard Business School",
    photoUrl: "/images/match-dan.jpg",
    photos: ["/images/match-dan.jpg", "/images/match-dan-2.jpg"],
    compatibility: 94,
    summary:
      "Dan came across as genuinely thoughtful and grounded. He talked about how he approaches his career with the same intention he brings to relationships. You both share a love of California culture, and he mentioned wanting someone who balances ambition with warmth -- which is exactly how you described yourself.",
    highlights: [
      "Same cultural background",
      "Shares your career drive",
      "Grew up near your hometown",
      "Looking for long-term",
    ],
    gender: "male",
  },
  {
    id: "2",
    name: "Alex",
    age: 30,
    height: "5'11\"",
    location: "SoHo",
    job: "Product Lead at Google",
    education: "MIT, Columbia MBA",
    photoUrl: "/images/match-alex.jpg",
    photos: ["/images/match-alex.jpg", "/images/match-alex-2.jpg"],
    compatibility: 88,
    summary:
      "Alex has a creative energy that matches yours. He talked about building products that help people connect, which lines up with your values. He is also super into hiking and has a golden retriever named Scout. Your sense of humor and adventurous streak really align.",
    highlights: [
      "Creative and driven",
      "Loves the outdoors",
      "Dog person",
      "Great sense of humor",
    ],
    gender: "male",
  },
  {
    id: "3",
    name: "Sarah",
    age: 28,
    height: "5'7\"",
    location: "West Village",
    job: "Architect at Foster+Partners",
    education: "Yale School of Architecture",
    photoUrl: "/images/match-sarah.jpg",
    photos: ["/images/match-sarah.jpg", "/images/match-sarah-2.jpg"],
    compatibility: 91,
    summary:
      "Sarah is incredibly articulate and passionate about design. She described wanting a partner who is intellectually curious and emotionally present -- she would absolutely appreciate your depth. She also mentioned loving Sunday farmers markets and long walks, just like you.",
    highlights: [
      "Intellectually curious",
      "Values emotional depth",
      "Loves Sunday rituals",
      "Design-minded",
    ],
    gender: "female",
  },
  {
    id: "4",
    name: "Emma",
    age: 27,
    height: "5'5\"",
    location: "Upper East Side",
    job: "Pediatric Resident at NYP",
    education: "Columbia Med",
    photoUrl: "/images/match-emma.jpg",
    photos: ["/images/match-emma.jpg", "/images/match-emma-2.jpg"],
    compatibility: 82,
    summary:
      "Emma is warm, compassionate, and has this infectious optimism. She is deep into her residency but still makes time for what matters. She mentioned wanting someone who understands ambition but also values quality time -- a balance you both seem to prioritize.",
    highlights: [
      "Warm and caring",
      "Values quality time",
      "Ambitious yet balanced",
      "Great communicator",
    ],
    gender: "female",
  },
  {
    id: "5",
    name: "James",
    age: 31,
    height: "6'0\"",
    location: "Chelsea",
    job: "Creative Director at R/GA",
    education: "RISD, SVA MFA",
    photoUrl: "/images/match-james.jpg",
    photos: ["/images/match-james.jpg", "/images/match-james-2.jpg"],
    compatibility: 86,
    summary:
      "James blends creativity with real emotional intelligence. He talked about how important honesty and vulnerability are in a relationship, which stood out. He is also a huge foodie and mentioned wanting someone to explore hole-in-the-wall restaurants with.",
    highlights: [
      "Emotionally intelligent",
      "Creative thinker",
      "Foodie explorer",
      "Values honesty",
    ],
    gender: "male",
  },
  {
    id: "6",
    name: "Marco",
    age: 29,
    height: "5'10\"",
    location: "Tribeca",
    job: "Founder at Olive Health",
    education: "Stanford, Wharton MBA",
    photoUrl: "/images/match-marco.jpg",
    photos: ["/images/match-marco.jpg", "/images/match-marco-2.jpg"],
    compatibility: 79,
    summary:
      "Marco has huge entrepreneurial energy and a contagious enthusiasm for life. He is building a health tech startup and talked about wanting a partner who is their own person with their own passions. He is active, loves travel, and is surprisingly good at cooking pasta from scratch.",
    highlights: [
      "Entrepreneurial spirit",
      "Loves to travel",
      "Passionate cook",
      "Independent mindset",
    ],
    gender: "male",
  },
]

// Map Lambda candidate names to SetupsView candidates
const LAMBDA_CANDIDATE_MAP: Record<string, string> = {
  "Alex - The Creative Nomad (Female)": "Alex",
  "Riley - The Culinary Artist (Female)": "Sarah",
  "Casey - The Musician (Female)": "Emma",
  "Taylor - The Wellness Advocate (Female)": "Sarah",
  "Quinn - The World Traveler (Female)": "Emma",
  "Avery - The Bookworm (Female)": "Sarah",
  "Jordan - The Tech Entrepreneur (Male)": "Alex",
  "Sam - The Outdoor Enthusiast (Male)": "Dan",
  "Morgan - The Intellectual Explorer (Male)": "James",
  "Blake - The Fitness Enthusiast (Male)": "Marco",
}

interface BubblePosition {
  x: number
  y: number
}

function useDraggable(
  initialPos: BubblePosition,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [pos, setPos] = useState(initialPos)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posRef = useRef(initialPos)
  const hasMoved = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    hasMoved.current = false
    dragStart.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      hasMoved.current = true
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newX = Math.max(
        0,
        Math.min(e.clientX - dragStart.current.x, rect.width - 10)
      )
      const newY = Math.max(
        0,
        Math.min(e.clientY - dragStart.current.y, rect.height - 10)
      )
      posRef.current = { x: newX, y: newY }
      setPos({ x: newX, y: newY })
    },
    [containerRef]
  )

  const onPointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return { pos, onPointerDown, onPointerMove, onPointerUp, hasMoved }
}

function CandidateBubble({
  candidate,
  initialPos,
  containerRef,
  onClick,
}: {
  candidate: Candidate
  initialPos: BubblePosition
  containerRef: React.RefObject<HTMLDivElement | null>
  onClick: () => void
}) {
  const { pos, onPointerDown, onPointerMove, onPointerUp, hasMoved } =
    useDraggable(initialPos, containerRef)

  // Make bubbles larger
  const size =
    candidate.compatibility >= 90
      ? 140
      : candidate.compatibility >= 85
        ? 120
        : candidate.compatibility >= 80
          ? 100
          : 85

  const glowOpacity =
    candidate.compatibility >= 90
      ? "0.5"
      : candidate.compatibility >= 85
        ? "0.35"
        : "0.2"

  return (
    <div
      className="absolute touch-none select-none cursor-grab active:cursor-grabbing"
      style={{
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => {
        onPointerUp()
        if (!hasMoved.current) onClick()
      }}
    >
      {/* Glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 20,
          height: size + 20,
          left: -10,
          top: -10,
          background: `radial-gradient(circle, hsla(260 60% 65% / ${glowOpacity}) 0%, transparent 70%)`,
        }}
      />
      {/* Main bubble */}
      <div
        className="relative rounded-full glass-strong flex flex-col items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Photo bg */}
        <Image
          src={candidate.photoUrl}
          alt={candidate.name}
          fill
          className="object-cover opacity-40"
          sizes={`${size}px`}
        />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="text-base font-medium text-foreground drop-shadow-lg">
            {candidate.name}
          </span>
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {candidate.compatibility}%
          </span>
        </div>
      </div>
    </div>
  )
}

function CandidateDetail({
  candidate,
  onClose,
  apiResponse,
}: {
  candidate: Candidate
  onClose: () => void
  apiResponse?: ApiResponse
}) {
  // Use Lambda summary if available, otherwise use candidate summary
  const displaySummary = apiResponse?.summary || candidate.summary
  return (
    <div className="absolute inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {/* Back button */}
        <div className="flex items-center px-5 pt-5 pb-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Back to matches
          </button>
        </div>

        <div className="px-5 pb-10">
          {/* Header with photo */}
          <div className="flex gap-4 mb-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0">
              <Image
                src={candidate.photoUrl}
                alt={candidate.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-serif text-foreground">
                {candidate.name}, {candidate.age}
              </h2>
              <p className="text-sm text-muted-foreground">
                {candidate.height}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">
                  {candidate.compatibility}% match
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-2 mb-5">
            <div className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-foreground">
                {candidate.location}
              </span>
            </div>
            <div className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-foreground">{candidate.job}</span>
            </div>
            <div className="glass-light rounded-xl px-4 py-2.5 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-sm text-foreground">
                {candidate.education}
              </span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-5">
            <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Hailey{"'"}s Take
            </h3>
            <div className="glass-light rounded-xl px-4 py-3">
              <p className="text-sm text-foreground/85 leading-relaxed">
                {displaySummary}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Why You Match
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.highlights.map((h) => (
                <span
                  key={h}
                  className="text-sm font-medium px-4 py-2 rounded-full bg-primary/30 text-foreground"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-2">
              Photos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {candidate.photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden glass-light"
                >
                  <Image
                    src={photo}
                    alt={`${candidate.name} photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 50vw, 200px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl glass-strong text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
              Pass
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
            >
              <Heart className="w-4 h-4" />
              Meet
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter candidates based on user's gender and orientation
function filterCandidatesByCompatibility(
  candidates: Candidate[],
  userGender?: string,
  userOrientation?: string
): Candidate[] {
  if (!userGender || !userOrientation) {
    return candidates // Show all if no filter info
  }

  const gender = userGender.toLowerCase()
  const orientation = userOrientation.toLowerCase()

  return candidates.filter((candidate) => {
    // Straight: opposite gender
    if (orientation.includes("straight") || orientation === "heterosexual") {
      if (gender === "male" || gender === "man") {
        return candidate.gender === "female"
      }
      if (gender === "female" || gender === "woman") {
        return candidate.gender === "male"
      }
    }

    // Gay/Lesbian: same gender
    if (orientation.includes("gay") || orientation.includes("lesbian")) {
      if (gender === "male" || gender === "man") {
        return candidate.gender === "male"
      }
      if (gender === "female" || gender === "woman") {
        return candidate.gender === "female"
      }
    }

    // Bisexual/Pansexual: show all
    if (
      orientation.includes("bisexual") ||
      orientation.includes("pansexual") ||
      orientation.includes("bi")
    ) {
      return true
    }

    // Default: show all if orientation not recognized
    return true
  })
}

// Extract candidate name from Lambda response
function extractCandidateNameFromLambda(apiResponse?: ApiResponse): string | null {
  if (!apiResponse?.meta?.candidate_profile) return null
  
  const profile = apiResponse.meta.candidate_profile.toLowerCase()
  
  // Try to match Lambda candidate names (check for key phrases from each profile)
  const candidateKeywords: Record<string, string[]> = {
    "Alex - The Creative Nomad (Female)": ["graphic designer", "vinyl collection", "coffee shops"],
    "Riley - The Culinary Artist (Female)": ["pastry chef", "michelin", "croissant"],
    "Casey - The Musician (Female)": ["jazz pianist", "music theory", "vintage records"],
    "Taylor - The Wellness Advocate (Female)": ["yoga instructor", "wellness coach", "meditation"],
    "Quinn - The World Traveler (Female)": ["travel photographer", "47 countries", "wanderlust"],
    "Avery - The Bookworm (Female)": ["librarian", "book club", "magical realism"],
    "Jordan - The Tech Entrepreneur (Male)": ["startup founder", "speakeasies", "philosophy"],
    "Sam - The Outdoor Enthusiast (Male)": ["park ranger", "rock climbing", "backpacking"],
    "Morgan - The Intellectual Explorer (Male)": ["history professor", "ancient civilizations", "museum dates"],
    "Blake - The Fitness Enthusiast (Male)": ["personal trainer", "nutrition coach", "gym at 6am"],
  }
  
  // Find the candidate with the most matching keywords
  let bestMatch: string | null = null
  let bestMatchCount = 0
  
  for (const [lambdaName, keywords] of Object.entries(candidateKeywords)) {
    const matchCount = keywords.filter((keyword) => profile.includes(keyword.toLowerCase())).length
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount
      bestMatch = lambdaName
    }
  }
  
  return bestMatch
}

function getRadius(compatibility: number) {
  // Updated to match larger bubble sizes
  if (compatibility >= 90) return 70
  if (compatibility >= 85) return 60
  if (compatibility >= 80) return 50
  return 42
}

function scatterPositions(
  candidates: Candidate[],
  width: number,
  height: number
): BubblePosition[] {
  const padding = 20
  const positions: BubblePosition[] = []
  const count = candidates.length

  // Seeded pseudo-random for deterministic layout
  let seed = 42
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }

  for (let i = 0; i < count; i++) {
    const candidate = candidates[i]
    const r = getRadius(candidate.compatibility)

    // Assign a vertical band based on rank (index) -- top for highest, bottom for lowest
    const bandHeight = (height - 2 * padding) / count
    const bandTop = padding + i * bandHeight
    const bandBottom = bandTop + bandHeight

    // Center Y in the band with some randomness
    const centerY = (bandTop + bandBottom) / 2
    const yJitter = bandHeight * 0.3

    let bestX = width / 2
    let bestY = centerY
    let bestMinDist = -1

    for (let attempt = 0; attempt < 300; attempt++) {
      const x = r + padding + rand() * (width - 2 * r - 2 * padding)
      const y = Math.max(
        r + padding,
        Math.min(height - r - padding, centerY + (rand() - 0.5) * 2 * yJitter)
      )

      let minDist = Infinity
      let overlapping = false
      for (let j = 0; j < positions.length; j++) {
        const otherR = getRadius(candidates[j].compatibility)
        const dx = x - positions[j].x
        const dy = y - positions[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minRequired = r + otherR + 14
        if (dist < minRequired) {
          overlapping = true
          break
        }
        minDist = Math.min(minDist, dist)
      }

      if (!overlapping && (positions.length === 0 || minDist > bestMinDist)) {
        bestX = x
        bestY = y
        bestMinDist = minDist
      }
    }

    positions.push({ x: bestX, y: bestY })
  }

  return positions
}

interface SetupsViewProps {
  formData?: FormData
  apiResponse?: ApiResponse
}

export function SetupsView({ formData, apiResponse }: SetupsViewProps = {}) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  )
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [positions, setPositions] = useState<BubblePosition[]>([])
  const hasScattered = useRef(false)

  // Filter candidates based on gender/orientation
  const filteredCandidates = filterCandidatesByCompatibility(
    CANDIDATES,
    formData?.gender,
    formData?.orientation
  )

  // Update compatibility score from Lambda if available
  const candidatesWithLambdaScore = filteredCandidates.map((candidate) => {
    // Try to match Lambda candidate to this candidate
    const lambdaCandidateName = extractCandidateNameFromLambda(apiResponse)
    if (lambdaCandidateName) {
      const mappedName = LAMBDA_CANDIDATE_MAP[lambdaCandidateName]
      if (mappedName === candidate.name && apiResponse?.score) {
        return { ...candidate, compatibility: apiResponse.score }
      }
    }
    return candidate
  })

  // Sort by compatibility
  const sortedCandidates = [...candidatesWithLambdaScore].sort(
    (a, b) => b.compatibility - a.compatibility
  )

  useEffect(() => {
    if (hasScattered.current) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      hasScattered.current = true
      setPositions(scatterPositions(sortedCandidates, rect.width, rect.height))
    }
  }, [sortedCandidates])

  return (
    <div className="flex flex-col h-full relative">
      {/* Title */}
      <div className="px-5 pt-2 pb-3 flex-shrink-0">
        <h2 className="text-xl font-serif text-foreground">Your Matches</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tap to explore, drag to rearrange
        </p>
      </div>

      {/* Bubble canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        {positions.length > 0 &&
          sortedCandidates.map((c, i) => (
            <CandidateBubble
              key={c.id}
              candidate={c}
              initialPos={positions[i]}
              containerRef={containerRef}
              onClick={() => setSelectedCandidate(c)}
            />
          ))}
      </div>

      {/* Detail sheet */}
      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          apiResponse={apiResponse}
        />
      )}
    </div>
  )
}
