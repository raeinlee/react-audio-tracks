import { describe, it, expect, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import useAudiotracks from "../useAudiotracks"
import useTrackStream from "../useTrackStream"
import AudiotrackManager from "../AudiotrackManager"
import { DEFAULT_VOLUME } from "../constants"

function reset() {
  AudiotrackManager.initialize({
    supportedLocales: ["en"],
    masterVolume: DEFAULT_VOLUME,
  })
  AudiotrackManager.toggleGlobalMute(false)
  AudiotrackManager.purgeTrack(0)
}

describe("useAudiotracks", () => {
  beforeEach(reset)

  it("returns the current state on mount", () => {
    const { result } = renderHook(() => useAudiotracks())
    expect(result.current.masterVolume).toBe(DEFAULT_VOLUME)
    expect(result.current.globalMuted).toBe(false)
  })

  it("re-renders with updated masterVolume when state changes", () => {
    const { result } = renderHook(() => useAudiotracks())
    act(() => {
      AudiotrackManager.setMasterVolume(0.9)
    })
    expect(result.current.masterVolume).toBe(0.9)
  })

  it("re-renders when globalMuted is toggled", () => {
    const { result } = renderHook(() => useAudiotracks())
    act(() => {
      AudiotrackManager.toggleGlobalMute(true)
    })
    expect(result.current.globalMuted).toBe(true)
  })

  it("reflects track state updates in the tracks array", () => {
    const { result } = renderHook(() => useAudiotracks())
    act(() => {
      AudiotrackManager.updateTrack(0, { volume: 0.4 })
    })
    expect(result.current.tracks[0]?.volume).toBe(0.4)
  })

  it("stops updating after the component unmounts", () => {
    const { result, unmount } = renderHook(() => useAudiotracks())
    unmount()
    act(() => {
      AudiotrackManager.setMasterVolume(0.1)
    })
    // result.current is frozen at the value captured before unmount
    expect(result.current.masterVolume).not.toBe(0.1)
  })
})

describe("useTrackStream", () => {
  beforeEach(reset)

  it("returns a stream and track instance for a valid index", () => {
    const { result } = renderHook(() => useTrackStream(0))
    const [stream, track] = result.current
    expect(stream).not.toBeNull()
    expect(track).not.toBeNull()
  })

  it("returns null for both when the track index is out of range", () => {
    const { result } = renderHook(() => useTrackStream(99))
    const [stream, track] = result.current
    expect(stream).toBeNull()
    expect(track).toBeNull()
  })

  it("returns null for both when the disabled option is true", () => {
    const { result } = renderHook(() =>
      useTrackStream(0, { disabled: true })
    )
    const [stream, track] = result.current
    expect(stream).toBeNull()
    expect(track).toBeNull()
  })

  it("stream trackIsPlaying starts as false", () => {
    const { result } = renderHook(() => useTrackStream(0))
    const [stream] = result.current
    expect(stream?.trackIsPlaying).toBe(false)
  })
})
