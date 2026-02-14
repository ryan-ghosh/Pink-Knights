"use client"

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "setups", label: "Setups" },
  { id: "matches", label: "Matches" },
  { id: "profile", label: "Profile" },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="grid grid-cols-3 items-center py-3 bg-nav border-t border-foreground/5"
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative flex flex-col items-center gap-1 transition-colors"
        >
          <span
            className={`text-sm font-sans tracking-wide transition-colors ${
              activeTab === tab.id
                ? "text-nav-active font-medium"
                : "text-nav-foreground font-normal"
            }`}
          >
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </nav>
  )
}
