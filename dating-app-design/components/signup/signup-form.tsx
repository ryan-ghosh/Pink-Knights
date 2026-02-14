"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StepIndicator } from "./step-indicator"
import { OptionPill } from "./option-pill"

interface FormData {
  // Basic Info
  firstName: string
  age: string
  gender: string
  orientation: string
  location: string
  height: string
  ethnicity: string
  religion: string
  hometown: string
  // Dating Intent
  lookingFor: string
  // Lifestyle
  education: string
  jobTitle: string
  employer: string
  smoking: string
  drinking: string
  marijuana: string
  otherDrugs: string
  politics: string
  religionImportance: string
  // Family
  wantChildren: string
  haveChildren: string
}

const GENDERS = ["Woman", "Man", "Non-binary", "Other"]
const ORIENTATIONS = ["Straight", "Gay", "Lesbian", "Bisexual", "Pansexual", "Queer", "Other"]
const RELIGIONS = [
  "Agnostic", "Atheist", "Buddhist", "Catholic", "Christian",
  "Hindu", "Jewish", "Muslim", "Spiritual", "Other", "Prefer not to say",
]
const ETHNICITIES = [
  "Asian", "Black", "Hispanic/Latino", "Middle Eastern",
  "Native American", "Pacific Islander", "White", "Mixed", "Other", "Prefer not to say",
]
const LOOKING_FOR = [
  "Long-term relationship",
  "Long-term, open to short",
  "Short-term",
  "Figuring it out",
]
const EDUCATION_LEVELS = [
  "High school", "Some college", "Associate's", "Bachelor's",
  "Master's", "Doctorate", "Trade school", "Other",
]
const SMOKING_OPTIONS = ["No", "Sometimes", "Yes"]
const DRINKING_OPTIONS = ["No", "Socially", "Frequently"]
const MARIJUANA_OPTIONS = ["No", "Sometimes", "Yes"]
const OTHER_DRUGS_OPTIONS = ["No", "Sometimes", "Yes"]
const POLITICS_OPTIONS = ["Liberal", "Moderate", "Conservative", "Other"]
const RELIGION_IMPORTANCE = ["Not important", "Somewhat important", "Very important"]
const WANT_CHILDREN = ["Yes", "No", "Open to it", "Not sure"]
const HAVE_CHILDREN = ["Yes", "No"]

const HEIGHTS = (() => {
  const h: string[] = []
  for (let ft = 4; ft <= 7; ft++) {
    const maxIn = ft === 7 ? 0 : 11
    for (let inc = ft === 4 ? 8 : 0; inc <= maxIn; inc++) {
      h.push(`${ft}'${inc}"`)
    }
  }
  return h
})()

const TOTAL_STEPS = 7

interface SignupFormProps {
  onComplete?: () => void
}

export function SignupForm({ onComplete }: SignupFormProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    age: "",
    gender: "",
    orientation: "",
    location: "",
    height: "",
    ethnicity: "",
    religion: "",
    hometown: "",
    lookingFor: "",
    education: "",
    jobTitle: "",
    employer: "",
    smoking: "",
    drinking: "",
    marijuana: "",
    otherDrugs: "",
    politics: "",
    religionImportance: "",
    wantChildren: "",
    haveChildren: "",
  })

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canSubmit = () => {
    return (
      formData.firstName.trim().length > 0 &&
      formData.age.trim().length > 0 &&
      formData.gender.length > 0 &&
      formData.orientation.length > 0 &&
      formData.location.trim().length > 0 &&
      formData.height.length > 0 &&
      formData.religion.length > 0 &&
      formData.lookingFor.length > 0 &&
      formData.education.length > 0 &&
      formData.jobTitle.trim().length > 0 &&
      formData.smoking.length > 0 &&
      formData.drinking.length > 0 &&
      formData.politics.length > 0 &&
      formData.religionImportance.length > 0 &&
      formData.wantChildren.length > 0 &&
      formData.haveChildren.length > 0
    )
  }

  const canProceed = () => {
    if (step === TOTAL_STEPS - 1) return canSubmit()
    return true
  }

  const stepTitle = () => {
    switch (step) {
      case 0: return "Let's start with the basics"
      case 1: return "How do you identify?"
      case 2: return "Where are you based?"
      case 3: return "What are you looking for?"
      case 4: return "What do you do?"
      case 5: return "Your lifestyle"
      case 6: return "Family plans"
      default: return ""
    }
  }

  const stepSubtitle = () => {
    switch (step) {
      case 0: return "Tell us a bit about yourself."
      case 1: return "This helps us find your best matches."
      case 2: return "We'll find people near you."
      case 3: return "So we can match your intentions."
      case 4: return "A little about your professional life."
      case 5: return "Helps us find compatible matches."
      case 6: return "Last step -- you're almost there."
      default: return ""
    }
  }

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    } else {
      onComplete?.()
    }
  }

  const back = () => {
    if (step > 0) setStep(step - 1)
  }

  const inputClass =
    "glass-light border-0 bg-transparent text-foreground placeholder:text-foreground/30 h-12 rounded-xl text-base focus-visible:ring-primary/50"

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Header - fixed */}
      <div className="flex-shrink-0 flex items-center gap-4 px-5 pt-3 pb-4">
        {step > 0 ? (
          <button
            onClick={back}
            className="flex h-9 w-9 items-center justify-center rounded-full glass-light text-foreground/80 transition-colors hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
        <div className="w-9" />
      </div>

      {/* Form Content - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6">
        <div key={step} className="animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {stepTitle()}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {stepSubtitle()}
          </p>

          {/* Step 0 -- Name & Age */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-foreground/70 text-xs uppercase tracking-wider">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  value={formData.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="age" className="text-foreground/70 text-xs uppercase tracking-wider">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => update("age", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Step 1 -- Gender & Orientation */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Gender</Label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <OptionPill key={g} label={g} selected={formData.gender === g} onSelect={() => update("gender", g)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Sexual Orientation</Label>
                <div className="flex flex-wrap gap-2">
                  {ORIENTATIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.orientation === o} onSelect={() => update("orientation", o)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 -- Location, Height, Hometown, Religion, Ethnicity */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="location" className="text-foreground/70 text-xs uppercase tracking-wider">Current Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => update("location", e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Height</Label>
                <Select value={formData.height} onValueChange={(v) => update("height", v)}>
                  <SelectTrigger className="glass-light border-0 bg-transparent text-foreground h-12 rounded-xl text-base focus:ring-primary/50 [&>span]:text-foreground/30 [&>span]:data-[value]:text-foreground">
                    <SelectValue placeholder="Select your height" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border/50 bg-background/95 backdrop-blur-xl text-foreground max-h-60">
                    {HEIGHTS.map((h) => (
                      <SelectItem key={h} value={h} className="text-foreground focus:bg-primary/20 focus:text-foreground">
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hometown" className="text-foreground/70 text-xs uppercase tracking-wider">Hometown</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                  <Input
                    id="hometown"
                    placeholder="Where did you grow up?"
                    value={formData.hometown}
                    onChange={(e) => update("hometown", e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Religion</Label>
                <div className="flex flex-wrap gap-2">
                  {RELIGIONS.map((r) => (
                    <OptionPill key={r} label={r} selected={formData.religion === r} onSelect={() => update("religion", r)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">
                  Ethnicity
                  <span className="ml-1 text-foreground/40 normal-case tracking-normal">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {ETHNICITIES.map((e) => (
                    <OptionPill key={e} label={e} selected={formData.ethnicity === e} onSelect={() => update("ethnicity", e)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 -- Dating Intent */}
          {step === 3 && (
            <div className="flex flex-col gap-3">
              <Label className="text-foreground/70 text-xs uppercase tracking-wider">Looking for</Label>
              <div className="flex flex-col gap-2">
                {LOOKING_FOR.map((option) => (
                  <OptionPill key={option} label={option} selected={formData.lookingFor === option} onSelect={() => update("lookingFor", option)} />
                ))}
              </div>
            </div>
          )}

          {/* Step 4 -- Career & Education */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Education Level</Label>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_LEVELS.map((e) => (
                    <OptionPill key={e} label={e} selected={formData.education === e} onSelect={() => update("education", e)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="jobTitle" className="text-foreground/70 text-xs uppercase tracking-wider">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => update("jobTitle", e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employer" className="text-foreground/70 text-xs uppercase tracking-wider">
                  Employer
                  <span className="ml-1 text-foreground/40 normal-case tracking-normal">(optional)</span>
                </Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                  <Input
                    id="employer"
                    placeholder="e.g. Google"
                    value={formData.employer}
                    onChange={(e) => update("employer", e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5 -- Lifestyle Habits */}
          {step === 5 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Smoking</Label>
                <div className="flex flex-wrap gap-2">
                  {SMOKING_OPTIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.smoking === o} onSelect={() => update("smoking", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Drinking</Label>
                <div className="flex flex-wrap gap-2">
                  {DRINKING_OPTIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.drinking === o} onSelect={() => update("drinking", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Marijuana</Label>
                <div className="flex flex-wrap gap-2">
                  {MARIJUANA_OPTIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.marijuana === o} onSelect={() => update("marijuana", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Other Drugs</Label>
                <div className="flex flex-wrap gap-2">
                  {OTHER_DRUGS_OPTIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.otherDrugs === o} onSelect={() => update("otherDrugs", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Politics</Label>
                <div className="flex flex-wrap gap-2">
                  {POLITICS_OPTIONS.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.politics === o} onSelect={() => update("politics", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Religion Importance</Label>
                <div className="flex flex-wrap gap-2">
                  {RELIGION_IMPORTANCE.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.religionImportance === o} onSelect={() => update("religionImportance", o)} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6 -- Family */}
          {step === 6 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Want children?</Label>
                <div className="flex flex-wrap gap-2">
                  {WANT_CHILDREN.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.wantChildren === o} onSelect={() => update("wantChildren", o)} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-foreground/70 text-xs uppercase tracking-wider">Have children?</Label>
                <div className="flex flex-wrap gap-2">
                  {HAVE_CHILDREN.map((o) => (
                    <OptionPill key={o} label={o} selected={formData.haveChildren === o} onSelect={() => update("haveChildren", o)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA - fixed */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 flex flex-col gap-3">
        <button
          onClick={next}
          disabled={!canProceed()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-30 disabled:shadow-none hover:brightness-110 active:scale-[0.98]"
        >
          {step === TOTAL_STEPS - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          Skip for demo
        </button>
      </div>
    </div>
  )
}
