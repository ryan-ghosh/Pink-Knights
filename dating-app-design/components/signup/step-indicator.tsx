"use client"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i < currentStep
              ? "bg-primary"
              : i === currentStep
                ? "bg-foreground/80"
                : "bg-foreground/15"
          }`}
        />
      ))}
    </div>
  )
}
