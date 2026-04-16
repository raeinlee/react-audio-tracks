import { describe, it, expect, beforeEach, vi } from "vitest"
import AudiotrackManager from "../AudiotrackManager"
import { DEFAULT_VOLUME } from "../constants"

// AudiotrackManager is a static singleton. Re-initialize before every test so
// each test starts from a predictable baseline.
function reset(trackLength = 1) {
  AudiotrackManager.initialize({
    supportedLocales: ["en"],
    masterVolume: DEFAULT_VOLUME,
    trackLength,
  })
  AudiotrackManager.toggleGlobalMute(false)
  AudiotrackManager.purgeTrack(0)
  // Dismiss any play requests left over from a previous test
  AudiotrackManager.getState().playRequests.forEach((pr) => {
    AudiotrackManager.dismissPlayRequest(pr.id)
  })
}

describe("AudiotrackManager", () => {
  beforeEach(() => reset())

  // ─── initialize ────────────────────────────────────────────────────────────

  describe("initialize", () => {
    it("sets masterVolume to DEFAULT_VOLUME", () => {
      expect(AudiotrackManager.getState().masterVolume).toBe(DEFAULT_VOLUME)
    })

    it("sets globalMuted to false", () => {
      expect(AudiotrackManager.getState().globalMuted).toBe(false)
    })

    it("starts with an empty playRequests list", () => {
      expect(AudiotrackManager.getState().playRequests).toHaveLength(0)
    })

    it("creates one track by default", () => {
      expect(AudiotrackManager.getState().tracks).toHaveLength(1)
    })

    it("creates the requested number of tracks when trackLength is given", () => {
      AudiotrackManager.initialize({ supportedLocales: ["en"], trackLength: 3 })
      expect(AudiotrackManager.getState().tracks).toHaveLength(3)
    })

    it("applies custom masterVolume", () => {
      AudiotrackManager.initialize({
        supportedLocales: ["en"],
        masterVolume: 0.25,
      })
      expect(AudiotrackManager.getState().masterVolume).toBe(0.25)
    })
  })

  // ─── setMasterVolume ────────────────────────────────────────────────────────

  describe("setMasterVolume", () => {
    it("updates masterVolume in state", () => {
      AudiotrackManager.setMasterVolume(0.8)
      expect(AudiotrackManager.getState().masterVolume).toBe(0.8)
    })

    it("notifies state listeners when volume changes", () => {
      const listener = vi.fn()
      const unsubscribe = AudiotrackManager.onStateChange(listener)
      AudiotrackManager.setMasterVolume(0.3)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ masterVolume: 0.3 })
      )
      unsubscribe()
    })
  })

  // ─── toggleGlobalMute ───────────────────────────────────────────────────────

  describe("toggleGlobalMute", () => {
    it("toggles globalMuted from false to true", () => {
      AudiotrackManager.toggleGlobalMute()
      expect(AudiotrackManager.getState().globalMuted).toBe(true)
    })

    it("toggles globalMuted from true back to false", () => {
      AudiotrackManager.toggleGlobalMute(true)
      AudiotrackManager.toggleGlobalMute()
      expect(AudiotrackManager.getState().globalMuted).toBe(false)
    })

    it("forces globalMuted to true with override", () => {
      AudiotrackManager.toggleGlobalMute(true)
      expect(AudiotrackManager.getState().globalMuted).toBe(true)
    })

    it("forces globalMuted to false with override", () => {
      AudiotrackManager.toggleGlobalMute(true)
      AudiotrackManager.toggleGlobalMute(false)
      expect(AudiotrackManager.getState().globalMuted).toBe(false)
    })

    it("mirrors muted state onto all tracks", () => {
      AudiotrackManager.toggleGlobalMute(true)
      const tracks = AudiotrackManager.getState().tracks
      expect(tracks.every((t) => t.muted)).toBe(true)
    })
  })

  // ─── getTrack / getTrackState ───────────────────────────────────────────────

  describe("getTrack", () => {
    it("returns a Track instance for a valid index", () => {
      expect(AudiotrackManager.getTrack(0)).not.toBeNull()
    })

    it("returns null for an out-of-range index", () => {
      expect(AudiotrackManager.getTrack(999)).toBeNull()
    })
  })

  describe("getTrackState", () => {
    it("returns state for a valid index", () => {
      const state = AudiotrackManager.getTrackState(0)
      expect(state).not.toBeNull()
      expect(state?.isPlaying).toBe(false)
    })

    it("returns null for an out-of-range index", () => {
      expect(AudiotrackManager.getTrackState(999)).toBeNull()
    })
  })

  // ─── updateTrack ────────────────────────────────────────────────────────────

  describe("updateTrack", () => {
    it("updates volume on the target track", () => {
      AudiotrackManager.updateTrack(0, { volume: 0.7 })
      expect(AudiotrackManager.getTrackState(0)?.volume).toBe(0.7)
    })

    it("updates muted on the target track", () => {
      AudiotrackManager.updateTrack(0, { muted: true })
      expect(AudiotrackManager.getTrackState(0)?.muted).toBe(true)
    })

    it("updates autoPlay on the target track", () => {
      AudiotrackManager.updateTrack(0, { autoPlay: true })
      expect(AudiotrackManager.getTrackState(0)?.autoPlay).toBe(true)
    })

    it("does nothing for an out-of-range index", () => {
      expect(() =>
        AudiotrackManager.updateTrack(999, { muted: true })
      ).not.toThrow()
    })
  })

  // ─── updateAllTracks ────────────────────────────────────────────────────────

  describe("updateAllTracks", () => {
    beforeEach(() => {
      // Expand to 2 tracks for these tests. Note: initialize only expands,
      // so after this suite there may be ≥ 2 tracks — subsequent tests use
      // only track 0 so this is safe.
      AudiotrackManager.initialize({ supportedLocales: ["en"], trackLength: 2 })
    })

    it("applies muted to every track", () => {
      AudiotrackManager.updateAllTracks({ muted: true })
      expect(
        AudiotrackManager.getState().tracks.every((t) => t.muted)
      ).toBe(true)
    })

    it("sets globalMuted when muted is provided", () => {
      AudiotrackManager.updateAllTracks({ muted: true })
      expect(AudiotrackManager.getState().globalMuted).toBe(true)
    })

    it("applies volume to every track", () => {
      AudiotrackManager.updateAllTracks({ volume: 0.6 })
      expect(
        AudiotrackManager.getState().tracks.every((t) => t.volume === 0.6)
      ).toBe(true)
    })
  })

  // ─── registerAudio ──────────────────────────────────────────────────────────

  describe("registerAudio", () => {
    it("adds an audio item to the default track queue", () => {
      AudiotrackManager.registerAudio("/test.mp3")
      expect(AudiotrackManager.getTrackState(0)?.queue).toHaveLength(1)
    })

    it("stores the correct src on the queued item", () => {
      AudiotrackManager.registerAudio("/hello.mp3")
      expect(AudiotrackManager.getTrackState(0)?.queue[0]?.src).toBe(
        "/hello.mp3"
      )
    })

    it("does not add a duplicate src by default", () => {
      AudiotrackManager.registerAudio("/test.mp3")
      AudiotrackManager.registerAudio("/test.mp3")
      expect(AudiotrackManager.getTrackState(0)?.queue).toHaveLength(1)
    })

    it("allows duplicate src when allowDuplicates is true", () => {
      AudiotrackManager.registerAudio("/test.mp3", { allowDuplicates: true })
      AudiotrackManager.registerAudio("/test.mp3", { allowDuplicates: true })
      expect(AudiotrackManager.getTrackState(0)?.queue).toHaveLength(2)
    })

    it("does not throw for an out-of-range trackIdx", () => {
      expect(() =>
        AudiotrackManager.registerAudio("/test.mp3", { trackIdx: 99 })
      ).not.toThrow()
    })
  })

  // ─── registerAudios ─────────────────────────────────────────────────────────

  describe("registerAudios", () => {
    it("registers multiple audio sources in a single call", () => {
      AudiotrackManager.registerAudios(["/a.mp3"], ["/b.mp3"])
      expect(AudiotrackManager.getTrackState(0)?.queue).toHaveLength(2)
    })
  })

  // ─── purgeTrack ─────────────────────────────────────────────────────────────

  describe("purgeTrack", () => {
    it("empties the track queue", () => {
      AudiotrackManager.registerAudio("/a.mp3")
      AudiotrackManager.registerAudio("/b.mp3", { allowDuplicates: true })
      AudiotrackManager.purgeTrack(0)
      expect(AudiotrackManager.getTrackState(0)?.queue).toHaveLength(0)
    })

    it("does nothing when the queue is already empty", () => {
      expect(() => AudiotrackManager.purgeTrack(0)).not.toThrow()
    })

    it("does nothing for an out-of-range index", () => {
      expect(() => AudiotrackManager.purgeTrack(99)).not.toThrow()
    })
  })

  // ─── skipTrack ──────────────────────────────────────────────────────────────

  describe("skipTrack", () => {
    it("does not throw when called on an empty queue", () => {
      expect(() => AudiotrackManager.skipTrack(0)).not.toThrow()
    })

    it("removes the current audio and advances to the next one", () => {
      AudiotrackManager.registerAudio("/first.mp3")
      AudiotrackManager.registerAudio("/second.mp3", { allowDuplicates: true })
      AudiotrackManager.skipTrack(0)
      const queue = AudiotrackManager.getTrackState(0)?.queue ?? []
      expect(queue.some((item) => item.src === "/second.mp3")).toBe(true)
    })
  })

  // ─── registerPlayRequests / dismissPlayRequest ──────────────────────────────

  describe("registerPlayRequests", () => {
    it("creates a play request and returns its uid", () => {
      const uids = AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      expect(AudiotrackManager.getState().playRequests).toHaveLength(1)
      expect(uids).toHaveLength(1)
      expect(typeof uids[0]).toBe("string")
    })

    it("returns an empty array for empty input", () => {
      expect(AudiotrackManager.registerPlayRequests([])).toHaveLength(0)
    })

    it("ignores requests for out-of-range trackIdx", () => {
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 99 },
      ])
      expect(AudiotrackManager.getState().playRequests).toHaveLength(0)
    })

    it("prevents duplicate play requests for the same src by default", () => {
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      expect(AudiotrackManager.getState().playRequests).toHaveLength(1)
    })

    it("play request has onAccept and onReject callbacks", () => {
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      const req = AudiotrackManager.getState().playRequests[0]!
      expect(typeof req.onAccept).toBe("function")
      expect(typeof req.onReject).toBe("function")
    })
  })

  describe("dismissPlayRequest", () => {
    it("removes the play request with the given id", () => {
      const [uid] = AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      AudiotrackManager.dismissPlayRequest(uid!)
      expect(AudiotrackManager.getState().playRequests).toHaveLength(0)
    })

    it("does nothing for an unknown id", () => {
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      AudiotrackManager.dismissPlayRequest("non-existent-id")
      expect(AudiotrackManager.getState().playRequests).toHaveLength(1)
    })

    it("calling onReject dismisses the request", () => {
      AudiotrackManager.registerPlayRequests([
        { src: "/test.mp3", trackIdx: 0 },
      ])
      const req = AudiotrackManager.getState().playRequests[0]!
      req.onReject()
      expect(AudiotrackManager.getState().playRequests).toHaveLength(0)
    })
  })

  // ─── onStateChange ──────────────────────────────────────────────────────────

  describe("onStateChange", () => {
    it("calls listener with updated state on every change", () => {
      const listener = vi.fn()
      const unsubscribe = AudiotrackManager.onStateChange(listener)
      AudiotrackManager.setMasterVolume(0.1)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ masterVolume: 0.1 })
      )
      unsubscribe()
    })

    it("stops calling listener after unsubscribe", () => {
      const listener = vi.fn()
      const unsubscribe = AudiotrackManager.onStateChange(listener)
      unsubscribe()
      AudiotrackManager.setMasterVolume(0.9)
      expect(listener).not.toHaveBeenCalled()
    })

    it("supports multiple independent listeners", () => {
      const a = vi.fn()
      const b = vi.fn()
      const unA = AudiotrackManager.onStateChange(a)
      const unB = AudiotrackManager.onStateChange(b)
      AudiotrackManager.setMasterVolume(0.2)
      expect(a).toHaveBeenCalledTimes(1)
      expect(b).toHaveBeenCalledTimes(1)
      unA()
      unB()
    })
  })

  // ─── Jitsi conference plugin ─────────────────────────────────────────────────

  describe("jitsi conference plugin", () => {
    it("initializes conference refs with given volume and muted", () => {
      AudiotrackManager.initializeConferenceRefs("pid1", {
        volume: 0.8,
        muted: false,
      })
      expect(
        AudiotrackManager.getState().jitsiConferenceContext["pid1"]
      ).toEqual({ volume: 0.8, muted: false })
    })

    it("does not overwrite an already-initialized participant", () => {
      AudiotrackManager.initializeConferenceRefs("pid1", { volume: 0.8 })
      AudiotrackManager.initializeConferenceRefs("pid1", { volume: 0.2 })
      expect(
        AudiotrackManager.getState().jitsiConferenceContext["pid1"]?.volume
      ).toBe(0.8)
    })

    it("updates volume for an existing participant", () => {
      AudiotrackManager.initializeConferenceRefs("pid1", { volume: 0.8 })
      AudiotrackManager.updateConferenceRefs("pid1", { volume: 0.5 })
      expect(
        AudiotrackManager.getState().jitsiConferenceContext["pid1"]?.volume
      ).toBe(0.5)
    })

    it("updates muted for an existing participant", () => {
      AudiotrackManager.initializeConferenceRefs("pid1", { muted: false })
      AudiotrackManager.updateConferenceRefs("pid1", { muted: true })
      expect(
        AudiotrackManager.getState().jitsiConferenceContext["pid1"]?.muted
      ).toBe(true)
    })

    it("auto-initializes participant when updateConferenceRefs is called first", () => {
      AudiotrackManager.updateConferenceRefs("pid-new", { volume: 0.4 })
      expect(
        AudiotrackManager.getState().jitsiConferenceContext["pid-new"]
      ).toBeDefined()
    })
  })
})
