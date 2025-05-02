/**
 * Chord utilities for transposing and formatting chords
 */

// Define the standard notes in western music
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Alternative notation for flats
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Common chord types
const CHORD_TYPES = ['', 'm', 'dim', 'aug', 'sus2', 'sus4', '7', 'maj7', 'm7', 'dim7', 'aug7', '6', 'm6', '9', 'maj9', 'm9'];

/**
 * Transpose a chord by a given number of semitones
 * 
 * @param chord - The chord to transpose (e.g., "C", "Am", "F#7")
 * @param semitones - Number of semitones to transpose by (positive or negative)
 * @param useFlats - Whether to use flat notation (♭) instead of sharps (♯)
 * @returns The transposed chord
 */
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (!chord || semitones === 0) return chord;
  
  // Extract the root note and the chord type
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord; // Not a valid chord
  
  const [, rootNote, chordType] = match;
  
  // Find the index of the root note
  let noteIndex = NOTES.indexOf(rootNote);
  if (noteIndex === -1) {
    // Try to find it in flat notation
    noteIndex = FLAT_NOTES.indexOf(rootNote);
    if (noteIndex === -1) return chord; // Not a recognized note
  }
  
  // Calculate the new index after transposition
  const newIndex = (noteIndex + semitones + 12) % 12;
  
  // Get the new root note
  const newRootNote = useFlats ? FLAT_NOTES[newIndex] : NOTES[newIndex];
  
  // Return the transposed chord
  return newRootNote + chordType;
}

/**
 * Transpose all chords in a chord sheet
 * 
 * @param chordSheet - The chord sheet text with chords in [Chord] format
 * @param semitones - Number of semitones to transpose by
 * @param useFlats - Whether to use flat notation
 * @returns The transposed chord sheet
 */
export function transposeChordSheet(chordSheet: string, semitones: number, useFlats = false): string {
  if (!chordSheet || semitones === 0) return chordSheet;
  
  // Regular expression to find chord patterns [Chord]
  return chordSheet.replace(/\[([^\]]+)\]/g, (match, chord) => {
    // Skip section headers like [Verse], [Chorus], etc.
    if (/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Solo|Coda)(\s*\d*)?$/i.test(chord)) {
      return match;
    }
    
    // Transpose the chord
    const transposedChord = transposeChord(chord, semitones, useFlats);
    return `[${transposedChord}]`;
  });
}

/**
 * Extract all unique chords from a chord sheet
 * 
 * @param chordSheet - The chord sheet text with chords in [Chord] format
 * @returns Array of unique chords found in the chord sheet
 */
export function extractChords(chordSheet: string): string[] {
  if (!chordSheet) return [];
  
  const chords = new Set<string>();
  const chordPattern = /\[([^\]]+)\]/g;
  
  let match;
  while ((match = chordPattern.exec(chordSheet)) !== null) {
    const chord = match[1];
    // Skip section headers like [Verse], [Chorus], etc.
    if (!/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Solo|Coda)(\s*\d*)?$/i.test(chord)) {
      chords.add(chord);
    }
  }
  
  return Array.from(chords).sort();
}

/**
 * Determine the key of a song based on the chords used
 * This is a simple heuristic and may not be accurate for all songs
 * 
 * @param chords - Array of chords used in the song
 * @returns The estimated key of the song
 */
export function estimateKey(chords: string[]): string | null {
  if (!chords || chords.length === 0) return null;
  
  // Count the occurrences of each root note
  const rootCounts: Record<string, number> = {};
  
  for (const chord of chords) {
    const match = chord.match(/^([A-G][#b]?)/);
    if (match) {
      const root = match[1];
      rootCounts[root] = (rootCounts[root] || 0) + 1;
    }
  }
  
  // Find the most common root note
  let mostCommonRoot = '';
  let highestCount = 0;
  
  for (const [root, count] of Object.entries(rootCounts)) {
    if (count > highestCount) {
      mostCommonRoot = root;
      highestCount = count;
    }
  }
  
  // Check if the most common chord is minor
  const isMostCommonMinor = chords.some(chord => 
    chord.startsWith(mostCommonRoot) && chord.includes('m') && !chord.includes('maj')
  );
  
  return mostCommonRoot + (isMostCommonMinor ? 'm' : '');
}
