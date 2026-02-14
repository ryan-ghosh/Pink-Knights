"use client"

import { useState } from "react"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  onTypingChange?: (typing: boolean) => void
}

export function ChatInput({ onSend, onTypingChange }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSend(value.trim())
      setValue("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 py-3 bg-nav border-t border-foreground/5"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onTypingChange?.(e.target.value.length > 0)
        }}
        onFocus={() => onTypingChange?.(value.length > 0)}
        onBlur={() => onTypingChange?.(false)}
        placeholder="Type here"
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-nav-foreground outline-none"
        aria-label="Type a message"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="text-primary disabled:text-nav-foreground transition-colors"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  )
}
