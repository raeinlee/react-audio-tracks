import { describe, it, expect } from "vitest"
import { dropFromArray, getCurrentCaption, getFileName, uuid } from "../utils"
import type { Subtitle } from "../types"

describe("dropFromArray", () => {
  it("drops element at a middle index", () => {
    expect(dropFromArray([1, 2, 3], 1)).toEqual([1, 3])
  })

  it("drops the first element", () => {
    expect(dropFromArray([1, 2, 3], 0)).toEqual([2, 3])
  })

  it("drops the last element", () => {
    expect(dropFromArray([1, 2, 3], 2)).toEqual([1, 2])
  })

  it("returns the original array for a negative index", () => {
    const arr = [1, 2, 3]
    expect(dropFromArray(arr, -1)).toBe(arr)
  })

  it("handles a single-element array", () => {
    expect(dropFromArray([42], 0)).toEqual([])
  })

  it("returns original array when input is not an Array", () => {
    // @ts-expect-error intentional invalid input
    const result = dropFromArray("not-array", 0)
    expect(result).toBe("not-array")
  })
})

describe("getCurrentCaption", () => {
  const subtitles: Subtitle[] = [
    { from: 0, to: 2, text: "Hello" },
    { from: 2, to: 4, text: { en: "World", fr: "Monde" } },
    { from: 4, to: 6, text: "Bye", metadata: { mood: "sad" } },
  ]

  it("returns matching plain string subtitle", () => {
    const result = getCurrentCaption(subtitles, 1)
    expect(result.text).toBe("Hello")
  })

  it("returns localized subtitle for matching locale", () => {
    const result = getCurrentCaption(subtitles, 3, "fr")
    expect(result.text).toBe("Monde")
  })

  it("returns localized subtitle for 'en' locale", () => {
    const result = getCurrentCaption(subtitles, 3, "en")
    expect(result.text).toBe("World")
  })

  it("returns empty text when time is after all subtitles", () => {
    const result = getCurrentCaption(subtitles, 10)
    expect(result.text).toBe("")
  })

  it("returns empty text when time is before all subtitles", () => {
    // subtitles start at 0 so time 0 should match first subtitle
    // but a negative time would miss
    const result = getCurrentCaption(subtitles, -1)
    expect(result.text).toBe("")
  })

  it("includes metadata when present on the matching subtitle", () => {
    const result = getCurrentCaption(subtitles, 5)
    expect(result.text).toBe("Bye")
    expect(result.metadata).toEqual({ mood: "sad" })
  })

  it("treats 'to' as an exclusive upper boundary", () => {
    // time=2: first subtitle ends (to=2, exclusive), second begins (from=2)
    const result = getCurrentCaption(subtitles, 2, "en")
    expect(result.text).toBe("World")
  })

  it("returns empty text for empty subtitles array", () => {
    const result = getCurrentCaption([], 1)
    expect(result.text).toBe("")
  })
})

describe("getFileName", () => {
  it("extracts filename without extension from a path", () => {
    expect(getFileName("/audio/track.mp3")).toBe("track")
  })

  it("handles a deeply nested path", () => {
    expect(getFileName("/a/b/c/file.wav")).toBe("file")
  })

  it("handles a bare filename with extension", () => {
    expect(getFileName("sound.ogg")).toBe("sound")
  })
})

describe("uuid", () => {
  it("returns a string of 35 characters", () => {
    expect(uuid()).toHaveLength(35)
  })

  it("places dashes at positions 7, 12, 17 and 22", () => {
    const id = uuid()
    expect(id[7]).toBe("-")
    expect(id[12]).toBe("-")
    expect(id[17]).toBe("-")
    expect(id[22]).toBe("-")
  })

  it("only contains valid hex characters and dashes", () => {
    const id = uuid()
    expect(id).toMatch(/^[a-f0-9-]+$/)
  })

  it("generates unique values across many calls", () => {
    const ids = new Set(Array.from({ length: 200 }, () => uuid()))
    expect(ids.size).toBe(200)
  })
})
