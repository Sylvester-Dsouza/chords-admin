"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface ChordFormatterProps {
  chordSheet: string
  className?: string
  highlightChords?: boolean
}

/**
 * ChordFormatter component
 *
 * This component takes a chord sheet in the format [Chord]Lyrics and formats it
 * with proper styling for chords and lyrics.
 *
 * Format examples:
 * 1. [G]Amazing [D]grace, how [C]sweet the [G]sound
 * 2. [Verse 1]
 *    [Em]There's a [D]place, where [G]mercy reigns and [C]never dies
 *
 * @param chordSheet - The chord sheet text to format
 * @param className - Additional CSS classes
 * @param highlightChords - Whether to highlight chords with color
 */
export function ChordFormatter({
  chordSheet,
  className,
  highlightChords = true
}: ChordFormatterProps) {
  if (!chordSheet) {
    return <div className={cn("text-muted-foreground", className)}>No chord sheet available</div>
  }

  // Parse the chord sheet
  const lines = chordSheet.split('\n')

  return (
    <div className={cn("font-mono whitespace-pre-wrap", className)}>
      {lines.map((line, lineIndex) => {
        // Check if this is a section header like {Verse}, {Chorus}, etc.
        if (line.trim().match(/^\{[\w\s\d]+\}$/)) {
          // Extract the section name from {Section}
          const sectionName = line.trim().slice(1, -1);
          return (
            <div
              key={`line-${lineIndex}`}
              className="font-bold text-primary mt-4 mb-2 uppercase tracking-wide"
            >
              {sectionName}
            </div>
          )
        }

        // Legacy support for section headers like [Verse], [Chorus], etc.
        if (line.trim().match(/^\[[\w\s\d]+\]$/) &&
            /^\[(verse|chorus|bridge|intro|outro|pre-chorus|interlude)\s*\d*\]$/i.test(line.trim())) {
          return (
            <div
              key={`line-${lineIndex}`}
              className="font-bold text-primary mt-4 mb-2"
            >
              {line}
            </div>
          )
        }

        // Process line with chords in [Chord] format
        if (line.includes('[') && line.includes(']')) {
          const parts: React.ReactNode[] = []
          let currentIndex = 0
          let partIndex = 0

          // Regular expression to find chord patterns [Chord]
          const chordPattern = /\[([^\]]+)\]/g
          let match

          while ((match = chordPattern.exec(line)) !== null) {
            // Add text before the chord
            if (match.index > currentIndex) {
              parts.push(
                <span key={`part-${lineIndex}-${partIndex++}`}>
                  {line.substring(currentIndex, match.index)}
                </span>
              )
            }

            // Add the chord
            parts.push(
              <span
                key={`chord-${lineIndex}-${partIndex++}`}
                className={highlightChords ? "text-primary font-bold" : "font-bold"}
              >
                {match[1]}
              </span>
            )

            currentIndex = match.index + match[0].length
          }

          // Add any remaining text after the last chord
          if (currentIndex < line.length) {
            parts.push(
              <span key={`part-${lineIndex}-${partIndex++}`}>
                {line.substring(currentIndex)}
              </span>
            )
          }

          return (
            <div key={`line-${lineIndex}`} className="my-1">
              {parts}
            </div>
          )
        }

        // Regular text line (no chords)
        return (
          <div key={`line-${lineIndex}`} className="my-1">
            {line}
          </div>
        )
      })}
    </div>
  )
}

/**
 * ChordPreview component
 *
 * This component provides a live preview of formatted chords with a split view
 * showing both the raw chord sheet and the formatted output.
 */
export function ChordPreview({
  chordSheet,
  onChange
}: {
  chordSheet: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Chord Sheet</label>
        <textarea
          placeholder="Enter chord notations"
          className="min-h-[400px] font-mono w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={chordSheet}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <p className="text-sm text-muted-foreground">
          <strong>Format Guide:</strong><br />
          - Use [Chord] for chord notations (e.g., [G], [Am7], [D/F#])<br />
          - Use &#123;Section&#125; for song sections (e.g., &#123;Verse&#125;, &#123;Chorus&#125;)<br />
          <br />
          <strong>Example:</strong><br />
          &#123;Verse 1&#125;<br />
          [G]Amazing [D]grace, how [C]sweet the [G]sound<br />
          [G]That saved a [D]wretch like [G]me<br />
          <br />
          &#123;Chorus&#125;<br />
          [C]I once was [G]lost, but [D]now am [G]found<br />
          [C]Was blind but [G]now I [D]see[G]
        </p>

      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Preview</label>
        <div className="min-h-[400px] w-full rounded-md border border-input bg-background p-3 overflow-auto">
          <ChordFormatter chordSheet={chordSheet} />
        </div>
        <p className="text-sm text-muted-foreground">
          This is how the chord sheet will appear to users
        </p>
      </div>
    </div>
  )
}
