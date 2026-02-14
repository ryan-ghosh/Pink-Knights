"use client"

interface ChatBubbleProps {
  message: string
  delay?: number
}

export function ChatBubble({ message, delay = 0 }: ChatBubbleProps) {
  return (
    <div
      className="glass-light rounded-2xl px-4 py-3 max-w-[90%] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm leading-relaxed text-foreground/95">{message}</p>
    </div>
  )
}
