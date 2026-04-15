# React Audio Tracks - AI Agent Context

## Library Overview

**react-audio-tracks** is a lightweight TypeScript library for managing multiple concurrent audio tracks with subtitle/caption support in React applications. It provides a sophisticated audio orchestration system with React hooks for state management.

## Core Architecture

### Main Components

1. **AudiotrackManager (RATM)** - `src/AudiotrackManager.ts`
   - Singleton class managing global audio state
   - Handles multiple concurrent tracks
   - Provides master volume and global mute controls
   - Uses private fields (#) for encapsulation
   - Observer pattern for state updates

2. **Track** - `src/Track.ts`
   - Manages individual audio track with queue system
   - Handles autoPlay, loop, volume, mute, playback rate
   - Emits state and stream updates to subscribers
   - Supports subtitle/caption synchronization

3. **AudioItem** - `src/AudioItem.ts`
   - Wrapper around HTMLAudioElement
   - Manages individual audio lifecycle
   - Handles custom update frequency with intervals
   - Event-driven callback system

4. **React Hooks**
   - `useAudiotracks()` - Global state observer hook
   - `useTrackStream(trackIdx)` - Individual track stream observer

### State Management Pattern

The library uses a **centralized observable pattern**:
- AudiotrackManager holds global state
- Tracks update their state via callbacks
- React components subscribe via hooks
- Changes propagate unidirectionally

### Key Features

- Multiple concurrent audio tracks
- Queue system with priority support
- Subtitle/caption with i18n support
- Custom update frequency for performance tuning
- Play request system for user interaction gating
- Master volume control
- Loop and autoPlay capabilities
- Duplicate detection

## File Structure

```
/src
├── AudiotrackManager.ts  # Main singleton manager
├── Track.ts              # Individual track manager
├── AudioItem.ts          # Audio element wrapper
├── types.ts              # TypeScript definitions
├── useAudiotracks.ts     # Global state hook
├── useTrackStream.ts     # Track-specific hook
├── utils.ts              # Utility functions
├── constants.ts          # Default values
└── index.ts              # Public exports

/example                  # Demo app (Vite + React)
```

## Critical Code Locations

### Initialization
- `AudiotrackManager.initialize()` - Entry point (line 89 in AudiotrackManager.ts)
- Called once at app startup with configuration

### Audio Registration
- `RATM.registerAudio(src, options)` - Main API (line 397 in AudiotrackManager.ts)
- `Track.registerAudio()` - Internal handler (line 456 in Track.ts)

### Queue Management
- Track queue is managed in `Track.#Queue` setter (line 82 in Track.ts)
- Auto-plays next item when current ends

### Subtitle Handling
- `getCurrentCaption()` - Caption lookup (line 9 in utils.ts)
- Updated on timeupdate events

## Known Issues & Bugs

### Critical Bug
**Location**: `Track.ts:522`
```typescript
if (soundIdx) {  // BUG: Should be `if (soundIdx === -1)`
```
This prevents clearing audio at index 0, causing memory leaks and queue corruption.

### Security/Quality Issues
1. **UUID generation bug** - `utils.ts:74` can produce undefined values
2. **React peer dependency** - Should be peerDependency, not dependency
3. **Console.log in production** - `Track.ts:622`
4. **Missing error boundaries** - No try-catch around audio operations
5. **No cleanup on track removal** - Potential memory leaks

## Common Development Tasks

### Adding New Features
1. Add types to `types.ts`
2. Implement in `AudiotrackManager.ts` or `Track.ts`
3. Export from `index.ts`
4. Update `README.md` with examples

### Debugging
- Set `debug: true` in `RATM.initialize()`
- Check browser console for audio state logs
- Use React DevTools to inspect hook state

### Testing Audio
- Use example app: `cd example && pnpm dev`
- URL params: `?t=5` (5 tracks), `?debug=true`

## TypeScript Configuration

- **Strict mode enabled**
- `noUncheckedIndexedAccess: true` - Forces null checks on arrays/objects
- Target: ES2016
- Module: CommonJS (for library)

## Build System

- **tsup** - Zero-config TypeScript bundler
- Outputs: CJS (`dist/index.js`), ESM (`dist/index.mjs`), Types (`dist/index.d.ts`)
- Command: `pnpm build`

## API Surface

### Static Methods (AudiotrackManager/RATM)
- `initialize(settings)` - Setup library
- `registerAudio(src, options)` - Add audio to track
- `registerAudios(...audios)` - Batch registration
- `playAudio(src, options)` - Play without tracks
- `setMasterVolume(volume)` - Global volume
- `toggleGlobalMute(override?)` - Global mute
- `skipTrack(trackIdx)` - Skip current audio
- `purgeTrack(trackIdx)` - Clear track queue
- `getTrack(index)` - Get Track instance
- `updateTrack(index, state)` - Update track config
- `updateAllTracks(state)` - Batch update

### Track Instance Methods
- `togglePlay(override?)` - Play/pause control
- `resumeTrack()` - Resume if paused
- `pauseTrack()` - Pause track
- `registerAudio(src, options)` - Add to queue
- `skipAudio(target?)` - Skip audio
- `getState()` - Get track state
- `getStream()` - Get stream state

## Dependencies

### Production
- `react@^18.2.0` - Should be peer dependency

### Development
- `typescript@^5.0.4`
- `tsup@^6.7.0` - Bundler
- `@changesets/cli@^2.26.1` - Version management
- `@types/react@^18.0.35`
- `prettier@^3.0.3`

## Publishing Workflow

1. Make changes
2. `pnpm changeset` - Create changeset
3. Changeset bot creates PR with version bump
4. Merge PR triggers `pnpm release` (build + publish)

## Best Practices for Contributors

1. **Always read files before editing**
2. **Preserve strict type safety** - No `any` types
3. **Use private fields (#)** for encapsulation
4. **Add JSDoc comments** for public APIs
5. **Test with example app** before committing
6. **Follow existing patterns** - Observer for state, callbacks for events
7. **Update types.ts** when adding features
8. **Check bundle size** after changes

## Common Patterns

### Adding a new Track property
1. Add to `MutTrackState` type in `types.ts`
2. Initialize in `Track.constructor`
3. Add setter in `Track.updateState()`
4. Propagate in `AudiotrackManager.updateTrack()`

### Adding a new callback
1. Add to `AudioCallbacks` type
2. Wire through Track → AudioItem
3. Call at appropriate lifecycle point
4. Document in README

## Performance Considerations

- **Custom update frequency**: Use `updateFrequencyMs` option for slow devices
- **Track count**: More tracks = more memory/CPU
- **Queue length**: Long queues hold references
- **Subtitle complexity**: Large subtitle files impact lookup

## Browser Compatibility

- Requires: ES2016+ JavaScript
- Uses: HTMLAudioElement API
- Uses: Private fields (#) - Requires modern browsers (2020+)
- No polyfills included

## Future Enhancement Ideas

- React 19 support with useTransition
- Web Audio API integration for advanced features
- Audio visualization support
- Persistent state (localStorage)
- Preloading/buffering strategies
- TypeScript 5.x utility types
- Testing suite (Vitest + Testing Library)
