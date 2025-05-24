// All major and minor keys for musical compositions
export const MUSICAL_KEYS = [
  // Major keys
  { value: "C", label: "C Major", type: "major" },
  { value: "C#", label: "C# Major", type: "major" },
  { value: "Db", label: "Db Major", type: "major" },
  { value: "D", label: "D Major", type: "major" },
  { value: "D#", label: "D# Major", type: "major" },
  { value: "Eb", label: "Eb Major", type: "major" },
  { value: "E", label: "E Major", type: "major" },
  { value: "F", label: "F Major", type: "major" },
  { value: "F#", label: "F# Major", type: "major" },
  { value: "Gb", label: "Gb Major", type: "major" },
  { value: "G", label: "G Major", type: "major" },
  { value: "G#", label: "G# Major", type: "major" },
  { value: "Ab", label: "Ab Major", type: "major" },
  { value: "A", label: "A Major", type: "major" },
  { value: "A#", label: "A# Major", type: "major" },
  { value: "Bb", label: "Bb Major", type: "major" },
  { value: "B", label: "B Major", type: "major" },
  
  // Minor keys
  { value: "Cm", label: "C Minor", type: "minor" },
  { value: "C#m", label: "C# Minor", type: "minor" },
  { value: "Dbm", label: "Db Minor", type: "minor" },
  { value: "Dm", label: "D Minor", type: "minor" },
  { value: "D#m", label: "D# Minor", type: "minor" },
  { value: "Ebm", label: "Eb Minor", type: "minor" },
  { value: "Em", label: "E Minor", type: "minor" },
  { value: "Fm", label: "F Minor", type: "minor" },
  { value: "F#m", label: "F# Minor", type: "minor" },
  { value: "Gbm", label: "Gb Minor", type: "minor" },
  { value: "Gm", label: "G Minor", type: "minor" },
  { value: "G#m", label: "G# Minor", type: "minor" },
  { value: "Abm", label: "Ab Minor", type: "minor" },
  { value: "Am", label: "A Minor", type: "minor" },
  { value: "A#m", label: "A# Minor", type: "minor" },
  { value: "Bbm", label: "Bb Minor", type: "minor" },
  { value: "Bm", label: "B Minor", type: "minor" },
] as const

export type MusicalKey = typeof MUSICAL_KEYS[number]
export type KeyValue = MusicalKey['value']
export type KeyType = MusicalKey['type']

// Helper function to get all key values for filtering
export const getAllKeyValues = (): KeyValue[] => {
  return MUSICAL_KEYS.map(key => key.value)
}

// Helper function to get keys by type
export const getKeysByType = (type: KeyType): MusicalKey[] => {
  return MUSICAL_KEYS.filter(key => key.type === type)
}

// Helper function to find a key by value
export const findKeyByValue = (value: string): MusicalKey | undefined => {
  return MUSICAL_KEYS.find(key => key.value === value)
}
