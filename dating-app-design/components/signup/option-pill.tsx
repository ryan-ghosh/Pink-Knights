"use client"

import { cn } from "@/lib/utils"

interface OptionPillProps {
  label: string
  selected: boolean
  onSelect: () => void
}

export function OptionPill({ label, selected, onSelect }: OptionPillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200",
        selected
          ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          : "glass-light text-foreground/80 hover:bg-foreground/10"
      )}
    >
      {label}
    </button>
  )
}
