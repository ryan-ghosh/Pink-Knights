"use client"

import { useState, useRef, useEffect } from "react"
import { MatchmakerHeader } from "./matchmaker-header"
import { ProfileCard } from "./profile-card"
import { ChatBubble } from "./chat-bubble"
import { ChatInput } from "./chat-input"
import { Check, X } from "lucide-react"

interface MatchProfile {
  name: string
  age: number
  height: string
  location: string
  job: string
  education: string
  photoUrl: string
  photoCount: number
}

interface MatchData {
  profile: MatchProfile
  intro: string
  reasons: string[]
  askMessage: string
}

const MATCHES: MatchData[] = [
  {
    profile: {
      name: "Dan",
      age: 32,
      height: "6'1\"",
      location: "Williamsburg",
      job: "VP at Morgan Stanley",
      education: "Harvard Business School, Stanford University",
      photoUrl: "/images/match-dan.jpg",
      photoCount: 6,
    },
    intro: "I've got someone new I want you to meet.",
    reasons: [
      "This one is easy \u2013 everything lines up.",
      "You're both lawyers who approach ambition with the same grounded, thoughtful energy, and you both grew up in similar parts of California.",
      "He meets all your non-negotiables: he's 32, 6'1\" and he's from the same cultural background.",
    ],
    askMessage: "Would you like to meet Dan?",
  },
  {
    profile: {
      name: "Alex",
      age: 30,
      height: "5'11\"",
      location: "SoHo",
      job: "Product Lead at Google",
      education: "MIT, Columbia MBA",
      photoUrl: "/images/match-alex.jpg",
      photoCount: 4,
    },
    intro: "I have someone else I think you'd really vibe with.",
    reasons: [
      "He's creative, driven, and has a similar sense of humor.",
      "Plus he's really into hiking and has a golden retriever \u2013 I know that's a bonus for you.",
    ],
    askMessage: "Would you like to meet Alex?",
  },
]

interface DisplayMessage {
  id: string
  type: "text" | "profile" | "ask" | "user" | "response"
  content?: string
  profile?: MatchProfile
}

export function MatchmakerView() {
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load messages for the current match
  useEffect(() => {
    if (hasLoaded && currentMatchIndex >= MATCHES.length) return

    const match = MATCHES[currentMatchIndex]
    if (!match) return

    const isFirst = messages.length === 0

    const newMessages: DisplayMessage[] = [
      {
        id: `intro-${currentMatchIndex}`,
        type: "text",
        content: match.intro,
      },
      {
        id: `profile-${currentMatchIndex}`,
        type: "profile",
        profile: match.profile,
      },
      ...match.reasons.map((r, i) => ({
        id: `reason-${currentMatchIndex}-${i}`,
        type: "text" as const,
        content: r,
      })),
      {
        id: `ask-${currentMatchIndex}`,
        type: "ask",
        content: match.askMessage,
      },
    ]

    if (isFirst) {
      setMessages(newMessages)
    } else {
      setMessages((prev) => [...prev, ...newMessages])
    }

    setHasLoaded(true)
    // Show popup shortly after the ask message renders
    setTimeout(() => setShowPopup(true), 800)
  }, [currentMatchIndex])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, showPopup])

  const handleDecision = (accepted: boolean) => {
    setShowPopup(false)

    const match = MATCHES[currentMatchIndex]
    const responseMsg: DisplayMessage = {
      id: `user-decision-${currentMatchIndex}`,
      type: "user",
      content: accepted ? "Yes, set it up!" : "Not this time",
    }

    const replyMsg: DisplayMessage = {
      id: `reply-${currentMatchIndex}`,
      type: "response",
      content: accepted
        ? `Amazing! I'll set up a time for you and ${match.profile.name}. You two are going to have a great time.`
        : `No worries at all! I'll keep looking for someone who's a better fit.`,
    }

    setMessages((prev) => [...prev, responseMsg, replyMsg])
    setIsSpeaking(true)

    setTimeout(() => {
      setIsSpeaking(false)
      if (currentMatchIndex < MATCHES.length - 1) {
        setTimeout(() => {
          setCurrentMatchIndex((prev) => prev + 1)
        }, 1200)
      }
    }, 1500)
  }

  const getSmartReply = (text: string): string => {
    const lower = text.toLowerCase()

    // Setups & scheduling
    if (lower.includes("setup") || lower.includes("set up") || lower.includes("schedule") || lower.includes("when")) {
      return "I'm working on coordinating schedules. Dan is free this Thursday evening and Alex mentioned he's open this weekend. Want me to lock something in?"
    }

    // Previous dates / how did it go
    if (lower.includes("date") || lower.includes("how did") || lower.includes("went") || lower.includes("last time") || lower.includes("previous")) {
      return "From what I gathered, your last date with Dan went really well -- you both mentioned wanting to see each other again. I'd say that's a great sign. Want me to set up a second date?"
    }

    // Profile changes
    if (lower.includes("profile") || lower.includes("change") || lower.includes("update") || lower.includes("edit") || lower.includes("photo") || lower.includes("bio")) {
      return "Of course! You can head to your Profile tab to update your photos, info, and preferences anytime. Want me to adjust what I'm looking for in your matches based on something specific?"
    }

    // Preferences / what I'm looking for
    if (lower.includes("prefer") || lower.includes("looking for") || lower.includes("type") || lower.includes("want") || lower.includes("ideal")) {
      return "Right now I'm focusing on ambitious, emotionally available people in your area who share your values. If you want to shift the vibe -- more creative types, different age range, specific interests -- just let me know and I'll recalibrate."
    }

    // Asking about a specific match
    if (lower.includes("dan") || lower.includes("alex") || lower.includes("sarah") || lower.includes("emma") || lower.includes("james") || lower.includes("marco")) {
      const name = lower.includes("dan") ? "Dan" : lower.includes("alex") ? "Alex" : lower.includes("sarah") ? "Sarah" : lower.includes("emma") ? "Emma" : lower.includes("james") ? "James" : "Marco"
      return `${name} has been really responsive! Based on your conversation, I think there's genuine chemistry there. Want me to share more details about ${name}'s interests or set something up?`
    }

    // Red flags / dealbreakers
    if (lower.includes("red flag") || lower.includes("dealbreaker") || lower.includes("no go") || lower.includes("don't want")) {
      return "Got it. I'll make sure to filter those out going forward. Your 'Red Flags' list on your profile result page is also a great place to keep track. Anything else I should watch out for?"
    }

    // Compliments / thanks
    if (lower.includes("thank") || lower.includes("awesome") || lower.includes("great") || lower.includes("love") || lower.includes("amazing")) {
      return "That means a lot! I'm here to make this as fun and easy as possible. Just keep the feedback coming and I'll keep finding better and better matches for you."
    }

    // More matches / show me more
    if (lower.includes("more") || lower.includes("another") || lower.includes("someone else") || lower.includes("next")) {
      return "I've actually been chatting with a few new people I think you'd really connect with. Give me a day or two and I'll have some fresh profiles ready for you!"
    }

    // General / catch-all with varied responses
    const generalReplies = [
      "That's a great point! I'll factor that into my search. Anything else on your mind?",
      "I hear you. Let me think about how to work that into your matches. In the meantime, check out your Setups tab -- there might be some new faces!",
      "Noted! I'm always refining my approach based on your feedback. The more you share, the better your matches will be.",
      "Interesting! I hadn't considered that angle. I'll keep it in mind for your next batch of matches. Anything else?",
      "Good to know! I'm here whenever you want to chat about your matches, update your preferences, or just vent about dating life.",
    ]
    return generalReplies[Math.floor(Math.random() * generalReplies.length)]
  }

  const handleSend = (text: string) => {
    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: text,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsListening(false)
    setIsSpeaking(true)

    // Simulate typing delay
    const delay = 800 + Math.random() * 1200
    setTimeout(() => {
      const reply: DisplayMessage = {
        id: `reply-${Date.now()}`,
        type: "response",
        content: getSmartReply(text),
      }
      setMessages((prev) => [...prev, reply])
      setIsSpeaking(false)
    }, delay)
  }

  const handleTypingChange = (typing: boolean) => {
    setIsListening(typing)
  }

  return (
    <div className="flex flex-col h-full relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <MatchmakerHeader
          name="Hailey"
          isSpeaking={isSpeaking}
          isListening={isListening}
        />
        <div className="flex flex-col gap-3">
          {messages.map((msg, index) => {
            if (msg.type === "profile" && msg.profile) {
              return (
                <ProfileCard
                  key={msg.id}
                  {...msg.profile}
                  onViewProfile={() => {}}
                />
              )
            }

            if (msg.type === "user") {
              return (
                <div key={msg.id} className="flex justify-end animate-fade-in-up">
                  <div className="glass-strong rounded-2xl px-4 py-3 max-w-[80%]">
                    <p className="text-sm leading-relaxed text-foreground/95">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )
            }

            if (msg.type === "response") {
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg.content || ""}
                  delay={0}
                />
              )
            }

            if (msg.type === "ask") {
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg.content || ""}
                  delay={index * 80}
                />
              )
            }

            return (
              <ChatBubble
                key={msg.id}
                message={msg.content || ""}
                delay={index * 80}
              />
            )
          })}
        </div>
      </div>

      {/* Yes / No Popup */}
      {showPopup && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/40 backdrop-blur-sm animate-fade-in-up">
          <div className="glass-strong rounded-3xl p-6 mx-6 max-w-sm w-full flex flex-col items-center gap-5 shadow-2xl">
            <p className="text-base font-medium text-foreground text-center text-balance leading-relaxed">
              {MATCHES[currentMatchIndex]?.askMessage}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDecision(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl glass-light text-foreground/70 hover:text-foreground hover:bg-destructive/20 transition-all duration-200 active:scale-95"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Pass</span>
              </button>
              <button
                onClick={() => handleDecision(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/40 border border-primary/30 text-foreground hover:bg-primary/60 transition-all duration-200 active:scale-95 shadow-lg shadow-primary/20"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Yes!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatInput onSend={handleSend} onTypingChange={handleTypingChange} />
    </div>
  )
}
