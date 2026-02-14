"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  X,
  MessageCircle,
  ChevronRight,
} from "lucide-react"

type DateStatus = "pending" | "scheduled" | "completed" | "cancelled"

interface DateSetup {
  id: string
  name: string
  age: number
  photo: string
  status: DateStatus
  location?: string
  dateTime?: string
  compatibility: number
  rating?: number
  review?: string
}

const INITIAL_SETUPS: DateSetup[] = [
  {
    id: "1",
    name: "Dan",
    age: 32,
    photo: "/images/match-dan.jpg",
    status: "scheduled",
    location: "Blue Bottle Coffee, Williamsburg",
    dateTime: "Thursday, Feb 20 at 7:30 PM",
    compatibility: 94,
  },
  {
    id: "2",
    name: "Sarah",
    age: 28,
    photo: "/images/match-sarah.jpg",
    status: "pending",
    compatibility: 91,
  },
  {
    id: "3",
    name: "Alex",
    age: 30,
    photo: "/images/match-alex.jpg",
    status: "completed",
    location: "Le Coucou, SoHo",
    dateTime: "Saturday, Feb 8 at 8:00 PM",
    compatibility: 88,
    rating: 4,
    review: "Really great conversation. We connected on a lot of things.",
  },
  {
    id: "4",
    name: "Emma",
    age: 27,
    photo: "/images/match-emma.jpg",
    status: "completed",
    location: "Dante, West Village",
    dateTime: "Friday, Jan 31 at 7:00 PM",
    compatibility: 82,
  },
  {
    id: "5",
    name: "James",
    age: 31,
    photo: "/images/match-james.jpg",
    status: "cancelled",
    compatibility: 86,
  },
]

const STATUS_CONFIG: Record<
  DateStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-400/15",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-emerald-400",
    bg: "bg-emerald-400/15",
  },
  completed: {
    label: "Completed",
    color: "text-primary",
    bg: "bg-primary/15",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
  },
}

const RATING_LABELS = [
  "Not a match",
  "Meh",
  "Decent",
  "Really liked",
  "Amazing",
]

const FEEDBACK_TAGS = [
  "Great conversation",
  "Funny",
  "Attractive",
  "Good listener",
  "Awkward",
  "No chemistry",
  "Want to see again",
  "Different in person",
]

function RatingModal({
  setup,
  onClose,
  onSubmit,
}: {
  setup: DateSetup
  onClose: () => void
  onSubmit: (rating: number, review: string, tags: string[]) => void
}) {
  const [rating, setRating] = useState(setup.rating || 0)
  const [review, setReview] = useState(setup.review || "")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full glass-strong rounded-t-3xl overflow-hidden animate-fade-in-up max-h-[85dvh] flex flex-col">
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        <div className="overflow-y-auto no-scrollbar px-5 pb-8 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-foreground/10">
              <Image
                src={setup.photo}
                alt={setup.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Rate your date with {setup.name}
              </h3>
              <p className="text-xs text-muted-foreground">{setup.dateTime}</p>
            </div>
          </div>

          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      s <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-foreground/20"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-primary animate-fade-in-up">
                {RATING_LABELS[rating - 1]}
              </p>
            )}
          </div>

          {/* Feedback tags */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-foreground/50">
              Quick feedback
            </p>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? "bg-primary/30 text-foreground font-medium"
                      : "glass-light text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text review */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-foreground/50">
              Notes (optional)
            </p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="How did it go?"
              rows={3}
              className="glass-light border-0 bg-transparent text-foreground text-sm rounded-xl px-4 py-3 placeholder:text-foreground/30 resize-none outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => onSubmit(rating, review, selectedTags)}
            disabled={rating === 0}
            className="w-full py-3.5 rounded-2xl bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all disabled:opacity-30 disabled:shadow-none hover:brightness-110 active:scale-[0.98]"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}

export function DateSetupsView() {
  const [setups, setSetups] = useState<DateSetup[]>(INITIAL_SETUPS)
  const [reviewTarget, setReviewTarget] = useState<DateSetup | null>(null)
  const [filter, setFilter] = useState<DateStatus | "all">("all")

  const handleReviewSubmit = (
    rating: number,
    review: string,
    _tags: string[]
  ) => {
    if (!reviewTarget) return
    setSetups((prev) =>
      prev.map((s) =>
        s.id === reviewTarget.id ? { ...s, rating, review } : s
      )
    )
    setReviewTarget(null)
  }

  const filtered =
    filter === "all" ? setups : setups.filter((s) => s.status === filter)

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <h2 className="text-xl font-serif text-foreground mb-1 mt-2">
          Your Dates
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Manage your setups, scheduled dates, and reviews
        </p>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
          {(["all", "pending", "scheduled", "completed", "cancelled"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                  filter === f
                    ? "bg-primary/30 text-foreground font-medium"
                    : "glass-light text-foreground/60 hover:text-foreground"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Date cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((setup) => {
            const statusCfg = STATUS_CONFIG[setup.status]
            return (
              <div
                key={setup.id}
                className="glass rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
              >
                {/* Top row: avatar, name, status */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-foreground/10 flex-shrink-0">
                    <Image
                      src={setup.photo}
                      alt={setup.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground">
                        {setup.name}, {setup.age}
                      </h3>
                      <span className="text-xs text-primary">
                        {setup.compatibility}%
                      </span>
                    </div>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${statusCfg.color} ${statusCfg.bg}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/30 flex-shrink-0" />
                </div>

                {/* Date details */}
                {(setup.dateTime || setup.location) && (
                  <div className="flex flex-col gap-1.5 pl-1">
                    {setup.dateTime && (
                      <div className="flex items-center gap-2 text-xs text-foreground/70">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {setup.dateTime}
                      </div>
                    )}
                    {setup.location && (
                      <div className="flex items-center gap-2 text-xs text-foreground/70">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {setup.location}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating display or rate button for completed dates */}
                {setup.status === "completed" && (
                  <div className="pt-1 border-t border-foreground/5">
                    {setup.rating ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= setup.rating!
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-foreground/15"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {RATING_LABELS[(setup.rating || 1) - 1]}
                          </span>
                        </div>
                        <button
                          onClick={() => setReviewTarget(setup)}
                          className="text-[10px] text-primary/70 hover:text-primary transition-colors"
                        >
                          Edit review
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewTarget(setup)}
                        className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Rate this date
                      </button>
                    )}
                    {setup.review && (
                      <p className="text-xs text-foreground/50 mt-1.5 leading-relaxed">
                        &ldquo;{setup.review}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Actions for pending */}
                {setup.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        setSetups((prev) =>
                          prev.map((s) =>
                            s.id === setup.id
                              ? { ...s, status: "cancelled" as DateStatus }
                              : s
                          )
                        )
                      }
                      className="flex-1 py-2 rounded-xl glass-light text-xs text-foreground/60 hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Pass
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-primary/25 text-xs text-foreground hover:bg-primary/40 transition-colors">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Schedule
                    </button>
                  </div>
                )}

                {/* Actions for cancelled */}
                {setup.status === "cancelled" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() =>
                        setSetups((prev) =>
                          prev.filter((s) => s.id !== setup.id)
                        )
                      }
                      className="flex-1 py-2 rounded-xl glass-light text-xs text-destructive/70 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3 inline mr-1" />
                      Remove
                    </button>
                    <button
                      onClick={() =>
                        setSetups((prev) =>
                          prev.map((s) =>
                            s.id === setup.id
                              ? { ...s, status: "pending" as DateStatus }
                              : s
                          )
                        )
                      }
                      className="flex-1 py-2 rounded-xl bg-primary/25 text-xs text-foreground hover:bg-primary/40 transition-colors"
                    >
                      Undo
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-10 h-10 text-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground">No dates here yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {reviewTarget && (
        <RatingModal
          setup={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
