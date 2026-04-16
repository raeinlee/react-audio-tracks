# Library Improvements Roadmap

## 🎯 High Priority Improvements

### 1. Add Error Handling and Try-Catch Blocks
**Issue**: No error boundaries around audio operations
**Risk**: Unhandled exceptions crash the app

**Locations Needing Protection**:
1. `AudioItem.play()` - Audio load failures
2. `Track.registerAudio()` - Invalid audio sources
3. `getCurrentCaption()` - Malformed subtitle data
4. Hook subscriptions - Component unmount edge cases

**Example Fix**:
```typescript
public play() {
  if (!this.#innerAudio) return

  try {
    this.#innerAudio.play()
      .catch((error) => {
        U.log(`Failed to play audio: ${error.message}`, this.#debug, 2)
        if (this.#onError) {
          this.#onError(new ErrorEvent('play-failed', {
            message: error.message
          }))
        }
      })
  } catch (error) {
    U.log(`Unexpected error in play(): ${error}`, this.#debug, 2)
  }
}
```

---

### 2. Add JSDoc Documentation
**Current**: Minimal documentation in code
**Need**: Better IDE autocomplete and developer experience

**Priority Locations**:
- All public methods in `AudiotrackManager`
- All public methods in `Track`
- Type definitions in `types.ts`
- Hook functions

**Example**:
```typescript
/**
 * Registers an audio source to a track's queue for playback.
 *
 * @param src - Audio file URL or path
 * @param options - Optional configuration for audio playback
 * @param options.trackIdx - Target track index (default: 0)
 * @param options.priority - Queue position priority (0 = highest)
 * @param options.loop - Whether to loop the audio
 * @param options.volume - Volume level 0-1
 * @param options.keyForSubtitles - Subtitle key for caption lookup
 *
 * @example
 * ```typescript
 * RATM.registerAudio('/audio.mp3', {
 *   trackIdx: 0,
 *   onPlay: () => console.log('Playing'),
 *   onEnd: () => console.log('Finished')
 * })
 * ```
 *
 * @see {@link AudioOptions} for all available options
 */
public static registerAudio = (...args: T.RegistrationArgTuple) => {
  // ...
}
```

---

## 🚀 Feature Enhancements

### 3. Add Audio Preloading
**Benefit**: Reduce playback lag

**Implementation**:
```typescript
type PreloadStrategy = 'none' | 'metadata' | 'auto'

interface AudioOptions {
  // ... existing options
  preload?: PreloadStrategy
}
```

---

### 4. Add Fade In/Out Support
**Use Case**: Smooth audio transitions

**API Design**:
```typescript
interface AudioOptions {
  fadeIn?: number  // milliseconds
  fadeOut?: number
}

// Usage
RATM.registerAudio('/audio.mp3', {
  fadeIn: 1000,  // 1 second fade in
  fadeOut: 500   // 0.5 second fade out
})
```

---

### 5. Add Audio Visualization Support
**Feature**: Expose AnalyserNode for visualizations

**Implementation**:
```typescript
class AudioItem {
  #audioContext?: AudioContext
  #analyser?: AnalyserNode

  getAnalyserNode(): AnalyserNode | null {
    // Return analyser for visualization
  }
}
```

---

### 6. Add Persistent State Option
**Use Case**: Remember volume/mute across sessions

**Implementation**:
```typescript
RATM.initialize({
  persistState: true,
  storageKey: 'ratm-state'
})

// Auto-saves to localStorage
// Auto-restores on init
```

---

### 7. TypeScript Enhancements
**Current**: TypeScript 5.0.4
**Opportunity**: Use latest TS 5.x features

**Improvements**:
- Use `satisfies` operator for better type inference
- Leverage const type parameters
- Use `using` keyword for resource cleanup (TS 5.2+)
- Improve discriminated union types

---

## 📚 Documentation Improvements

### 8. Enhance README.md
**Add**:
- Installation instructions
- Quick start guide
- API reference table
- TypeScript examples
- Common use cases
- Troubleshooting section
- Migration guide (if breaking changes)
- Performance tips
- Browser compatibility table

### 9. Create CONTRIBUTING.md
**Include**:
- Development setup
- Code style guidelines
- Testing requirements
- PR process
- Changeset workflow

### 10. Add API Documentation Site
**Options**:
- TypeDoc for auto-generated docs
- Docusaurus for comprehensive docs site
- Deploy to Vercel/Netlify

---

## 🔧 Build & Tooling

### 11. Add Source Maps
**Current**: No source maps in production
**Impact**: Debugging is harder

**Fix in `package.json`**:
```json
"scripts": {
  "build": "tsup index.ts --format cjs,esm --dts --sourcemap"
}
```

### 12. Add Bundle Size Monitoring
**Tool**: bundlephobia or size-limit

```json
{
  "size-limit": [
    {
      "path": "dist/index.js",
      "limit": "10 KB"
    }
  ]
}
```

### 13. Add ESLint Configuration
**Currently**: No linting beyond TypeScript

**Setup**:
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Rules to enforce**:
- No console.log (warn in dev, error in production)
- Prefer const over let
- No unused variables
- Explicit function return types

---

## ♿ Accessibility

### 14. Add ARIA Support
**Feature**: Accessibility announcements for audio state

**Implementation**:
```typescript
interface AudiotrackManagerSettings {
  enableAriaLive?: boolean
}

// Announces to screen readers
"Now playing: [audio title]"
"Audio paused"
"Volume changed to 75%"
```

### 15. Add Keyboard Controls
**Feature**: Keyboard shortcuts for audio control

**Example**:
- Space: Play/Pause
- M: Mute/Unmute
- Arrow keys: Volume control

---

## 🎨 Developer Experience

### 16. Add React DevTools Integration
**Feature**: Custom DevTools panel for debugging

**Shows**:
- Track states
- Queue contents
- Current audio info
- Performance metrics

### 17. Add Debug Mode Enhancements
**Current**: Basic console.log
**Enhancement**: Structured logging with levels

```typescript
RATM.initialize({
  debug: {
    enabled: true,
    level: 'verbose', // 'error' | 'warn' | 'info' | 'verbose'
    logStateChanges: true,
    logAudioEvents: true
  }
})
```

---

## 📊 Performance

### 18. Optimize Re-renders
**Issue**: State updates may cause unnecessary re-renders

**Solution**: Use shallow equality checks in hooks
```typescript
import { useSyncExternalStore } from 'react'

function useAudiotracks() {
  return useSyncExternalStore(
    AudiotrackManager.onStateChange,
    AudiotrackManager.getState,
    AudiotrackManager.getState
  )
}
```

### 19. Add Virtual Queue
**Use Case**: Handle very long queues efficiently

**Concept**: Only keep active + next N items in memory

---

## 🔒 Security

### 20. Add CSP Compatibility
**Ensure**: Works with Content Security Policy

**Test**: Example app with strict CSP headers

### 21. Add Input Validation
**Locations**:
- Audio URL validation
- Track index bounds checking
- Volume range validation (0-1)
- Subtitle data validation

---

## 📱 Mobile Support

### 22. Improve Mobile Experience
**Issues**:
- Autoplay restrictions
- Background playback

**Features**:
- Better autoplay policy handling
- Background audio support (Media Session API)
- Battery-conscious update frequencies

---

## Implementation Priority

**Phase 1** (Critical - Do First):
1. Fix critical bugs (ISSUES.md)
2. Fix dependency configuration
3. Add basic tests
4. Add error handling

**Phase 2** (Important):
5. Improve type safety
6. Add JSDoc documentation
7. Add source maps
8. Add ESLint

**Phase 3** (Nice to Have):
9. Audio preloading
10. Fade in/out
11. Persistent state
12. Better documentation

**Phase 4** (Future):
13. Audio visualization
14. React DevTools integration
15. Advanced features
