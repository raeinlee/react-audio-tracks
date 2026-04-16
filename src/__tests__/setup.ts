import "@testing-library/jest-dom"
import { vi } from "vitest"

// jsdom doesn't implement HTMLMediaElement playback — mock the methods so
// AudioItem can be constructed and events can be dispatched without errors.
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: vi.fn(() => Promise.resolve()),
})

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: vi.fn(),
})
