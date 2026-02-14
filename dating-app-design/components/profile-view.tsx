"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Calendar,
  Heart,
  Pencil,
  PawPrint,
  X,
  Camera,
  Plus,
  Check,
  ImagePlus,
} from "lucide-react"

const PET_OPTIONS = [
  "Dog",
  "Cat",
  "Bird",
  "Reptile",
  "Insect",
  "Fish",
  "Rabbit",
  "Hamster",
  "Horse",
  "None",
]

const MAX_PHOTOS = 6

interface ProfileData {
  name: string
  age: string
  height: string
  location: string
  occupation: string
  education: string
  lookingFor: string
}

export function ProfileView() {
  const [isEditing, setIsEditing] = useState(false)
  const [pets, setPets] = useState<string[]>(["Dog"])
  const [showPetPicker, setShowPetPicker] = useState(false)
  const [photos, setPhotos] = useState<string[]>(["/images/matchmaker.jpg"])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [ageMin, setAgeMin] = useState("28")
  const [ageMax, setAgeMax] = useState("35")
  const [maxDistance, setMaxDistance] = useState("15")
  const [nonNegotiables, setNonNegotiables] = useState([
    "6'+",
    "College educated",
    "Same cultural background",
    "Non-smoker",
  ])
  const [newNonNeg, setNewNonNeg] = useState("")
  const [editingPrefs, setEditingPrefs] = useState(false)

  const addNonNeg = () => {
    const trimmed = newNonNeg.trim()
    if (trimmed && !nonNegotiables.includes(trimmed) && nonNegotiables.length < 8) {
      setNonNegotiables((prev) => [...prev, trimmed])
      setNewNonNeg("")
    }
  }

  const removeNonNeg = (tag: string) => {
    setNonNegotiables((prev) => prev.filter((t) => t !== tag))
  }

  const [profile, setProfile] = useState<ProfileData>({
    name: "Jessica",
    age: "28",
    height: "5'6\"",
    location: "Nob Hill, San Francisco",
    occupation: "Associate at Davis Polk",
    education: "Stanford Law, UC Berkeley",
    lookingFor: "Something serious",
  })

  const updateField = (key: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const togglePet = (pet: string) => {
    if (pet === "None") {
      setPets(["None"])
      return
    }
    setPets((prev) => {
      const filtered = prev.filter((p) => p !== "None")
      if (filtered.includes(pet)) {
        return filtered.filter((p) => p !== pet)
      }
      return [...filtered, pet]
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotos((prev) => {
        const updated = [...prev]
        updated[0] = url
        return updated
      })
    }
  }

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && photos.length < MAX_PHOTOS) {
      const url = URL.createObjectURL(file)
      setPhotos((prev) => [...prev, url])
    }
  }

  const removePhoto = (index: number) => {
    if (index === 0) return // can't remove main photo
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const profileFields: {
    key: keyof ProfileData
    label: string
    icon: React.ReactNode
  }[] = [
    { key: "age", label: "Age", icon: <Calendar className="w-4 h-4 text-primary" /> },
    { key: "height", label: "Height", icon: <Ruler className="w-4 h-4 text-primary" /> },
    {
      key: "location",
      label: "Location",
      icon: <MapPin className="w-4 h-4 text-red-400" />,
    },
    {
      key: "occupation",
      label: "Occupation",
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
    },
    {
      key: "education",
      label: "Education",
      icon: <GraduationCap className="w-4 h-4 text-blue-400" />,
    },
    {
      key: "lookingFor",
      label: "Looking for",
      icon: <Heart className="w-4 h-4 text-pink-400" />,
    },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar px-4 pt-4 pb-8">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="relative">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30">
            <Image
              src={photos[0]}
              alt="Your profile photo"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          {isEditing && (
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-110"
              aria-label="Change profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="text-center">
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="text-2xl font-serif text-foreground text-center bg-transparent border-b border-primary/40 outline-none focus:border-primary pb-0.5 w-48"
            />
          ) : (
            <h2 className="text-2xl font-serif text-foreground">
              {profile.name}
            </h2>
          )}
          <p className="text-sm text-foreground/50 mt-1">
            Member since January 2025
          </p>
        </div>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors ${
            isEditing
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "glass text-foreground/80 hover:bg-foreground/10"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          ) : (
            <>
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Photo grid - only visible in edit mode */}
      {isEditing && (
        <div className="flex flex-col gap-3 mb-6">
          <h3 className="text-xs uppercase tracking-wider text-foreground/50 px-1">
            Your Photos ({photos.length}/{MAX_PHOTOS})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, i) => (
              <div
                key={`${photo}-${i}`}
                className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-foreground/10"
              >
                <Image
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                {i > 0 && (
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 hover:text-white transition-colors"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-medium bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl glass-light flex flex-col items-center justify-center gap-1 text-foreground/40 hover:text-foreground/70 transition-colors"
                aria-label="Add photo"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[10px]">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAddPhoto}
          />
        </div>
      )}

      {/* About You */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs uppercase tracking-wider text-foreground/50 px-1">
          About You
        </h3>
        {profileFields.map((field) => (
          <div
            key={field.key}
            className="glass-light rounded-xl px-4 py-3 flex items-center gap-3"
          >
            {field.icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/50">{field.label}</p>
              {isEditing ? (
                <input
                  type="text"
                  value={profile[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-full text-sm text-foreground bg-transparent border-b border-foreground/20 outline-none focus:border-primary py-0.5 mt-0.5"
                />
              ) : (
                <p className="text-sm text-foreground">{profile[field.key]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pets */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs uppercase tracking-wider text-foreground/50">
            Pets
          </h3>
          <button
            onClick={() => setShowPetPicker((v) => !v)}
            className="text-xs text-foreground hover:text-foreground/80 transition-colors"
          >
            {showPetPicker ? "Done" : "Edit"}
          </button>
        </div>
        <div className="glass-light rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <PawPrint className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-foreground/50">Your pets</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pets.map((pet) => (
              <span
                key={pet}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/30 text-foreground"
              >
                {pet}
                {showPetPicker && (
                  <button
                    onClick={() => togglePet(pet)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    aria-label={`Remove ${pet}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {showPetPicker && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-foreground/10">
              {PET_OPTIONS.filter((p) => !pets.includes(p)).map((pet) => (
                <button
                  key={pet}
                  onClick={() => togglePet(pet)}
                  className="text-xs px-2.5 py-1 rounded-full glass-strong text-foreground/60 hover:text-foreground hover:bg-primary/15 transition-colors"
                >
                  + {pet}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preferences */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs uppercase tracking-wider text-foreground/50">
            Preferences
          </h3>
          <button
            onClick={() => setEditingPrefs((v) => !v)}
            className="text-xs text-foreground hover:text-foreground/80 transition-colors"
          >
            {editingPrefs ? "Done" : "Edit"}
          </button>
        </div>

        {/* Age Range */}
        <div className="glass-light rounded-xl px-4 py-3">
          <p className="text-xs text-foreground/50 mb-1">Age Range</p>
          {editingPrefs ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                className="w-14 text-sm text-foreground bg-transparent border-b border-foreground/20 outline-none focus:border-primary py-0.5 text-center"
                min={18}
                max={99}
              />
              <span className="text-sm text-foreground/50">to</span>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                className="w-14 text-sm text-foreground bg-transparent border-b border-foreground/20 outline-none focus:border-primary py-0.5 text-center"
                min={18}
                max={99}
              />
            </div>
          ) : (
            <p className="text-sm text-foreground">
              {ageMin} - {ageMax}
            </p>
          )}
        </div>

        {/* Maximum Distance */}
        <div className="glass-light rounded-xl px-4 py-3">
          <p className="text-xs text-foreground/50 mb-1">Maximum Distance</p>
          {editingPrefs ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                className="w-16 text-sm text-foreground bg-transparent border-b border-foreground/20 outline-none focus:border-primary py-0.5 text-center"
                min={1}
                max={200}
              />
              <span className="text-sm text-foreground/50">miles</span>
            </div>
          ) : (
            <p className="text-sm text-foreground">{maxDistance} miles</p>
          )}
        </div>

        {/* Non-negotiables */}
        <div className="glass-light rounded-xl px-4 py-3">
          <p className="text-xs text-foreground/50 mb-1">Non-negotiables</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {nonNegotiables.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/30 text-foreground"
              >
                {tag}
                {editingPrefs && (
                  <button
                    onClick={() => removeNonNeg(tag)}
                    className="ml-0.5 hover:text-destructive transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
          {editingPrefs && nonNegotiables.length < 8 && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-foreground/10">
              <input
                type="text"
                value={newNonNeg}
                onChange={(e) => setNewNonNeg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNonNeg()}
                placeholder="Add non-negotiable..."
                className="flex-1 h-8 rounded-full bg-transparent px-3 text-xs text-foreground placeholder:text-foreground/30 glass border-0 outline-none focus:ring-1 focus:ring-primary/40"
              />
              <button
                onClick={addNonNeg}
                disabled={!newNonNeg.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full glass-strong text-foreground/70 hover:text-foreground transition-colors disabled:opacity-30"
                aria-label="Add non-negotiable"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {editingPrefs && (
            <p className="text-[10px] text-foreground/40 mt-2">
              {nonNegotiables.length}/8 non-negotiables
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
