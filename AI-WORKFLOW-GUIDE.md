# AI Agent Workflow Guide

Quick reference for AI agents working on this codebase.

## 🚦 Before Making Changes

1. **Read the claude.md file first** - Contains architecture overview
2. **Check ISSUES.md** - Don't introduce known bugs
3. **Review IMPROVEMENTS.md** - Align with improvement roadmap
4. **Read existing code** - Understand patterns before modifying

## 📝 Common Tasks

### Task: Fix a Bug

1. **Locate the file** - Use reference from ISSUES.md
2. **Read the entire file** - Understand context
3. **Read related files** - Check dependencies
4. **Make minimal changes** - Don't refactor unrelated code
5. **Test with example app**:
   ```bash
   pnpm build
   cd example
   pnpm dev
   ```
6. **Verify TypeScript**:
   ```bash
   pnpm run lint
   ```

### Task: Add a New Feature

**Example: Adding fade in/out support**

1. **Update types** (`src/types.ts`):
   ```typescript
   export type AudioOptions = {
     // ... existing options
     fadeIn?: number
     fadeOut?: number
   }
   ```

2. **Implement in AudioItem** (`src/AudioItem.ts`):
   ```typescript
   #fadeIn?: number
   #fadeOut?: number

   constructor(parameters: ...) {
     this.#fadeIn = parameters.fadeIn
     this.#fadeOut = parameters.fadeOut
   }

   public play() {
     if (this.#fadeIn) {
       // Implement fade logic
     }
     this.#innerAudio?.play()
   }
   ```

3. **Wire through Track** (`src/Track.ts`):
   ```typescript
   #createAudio(src: string, audioOptions: T.AudioCallbacks & T.AudioOptions) {
     const { fadeIn, fadeOut, ...rest } = audioOptions
     // Pass to AudioItem constructor
   }
   ```

4. **Update exports** (`index.ts`) - If adding types

5. **Update README.md** - Add usage example

6. **Test thoroughly**

### Task: Improve Type Safety

**Pattern: Remove non-null assertions**

❌ **Before**:
```typescript
const track = this.#Tracks[index]!
track.purgeTrack()
```

✅ **After**:
```typescript
const track = this.#Tracks[index]
if (!track) {
  U.log(`Track at index ${index} not found`, this.#debug, 1)
  return
}
track.purgeTrack()
```

**Apply everywhere you see**:
- `array[index]!`
- `object.property!`
- Optional chaining may also be appropriate: `object?.property`

### Task: Add Documentation

**JSDoc Template**:
```typescript
/**
 * Brief description of what the function does.
 *
 * More detailed explanation if needed.
 * Can span multiple lines.
 *
 * @param paramName - Description of parameter
 * @param options - Configuration object
 * @param options.volume - Volume level (0-1)
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * RATM.functionName('/path', {
 *   volume: 0.5
 * })
 * ```
 *
 * @throws {Error} When invalid parameter
 * @see {@link RelatedType} for related information
 * @since 1.3.0
 */
```

**Priority order**:
1. Public API methods in AudiotrackManager
2. Public Track methods
3. Hook functions
4. Type definitions
5. Utility functions

## 🎯 Code Style Guidelines

### TypeScript
- Use **private fields (#)** for class internals
- Use **strict null checks** - no assumptions
- Use **readonly** for immutable properties
- Prefer **const** over let
- Use **type** over interface (current convention)

### Naming Conventions
- Classes: PascalCase (`AudiotrackManager`)
- Methods/functions: camelCase (`registerAudio`)
- Private fields: `#camelCase`
- Constants: UPPER_SNAKE_CASE (`DEFAULT_VOLUME`)
- Types: PascalCase (`AudioOptions`)

### File Organization
- Imports at top, grouped:
  1. React imports
  2. Internal imports
  3. Type imports
- Constants after imports
- Class definition
- Export at bottom

### State Management Pattern
```typescript
// Use getter/setter to ensure emit
get #State(): StateType {
  return this.#state
}

set #State(value: StateType) {
  this.#state = value
  this.emit()  // Always emit on state change
}

// Use private update method for partial updates
#updateState(value?: Partial<StateType>) {
  const prev = this.#State
  const newState = { ...prev, ...value }
  this.#State = newState  // Triggers setter
}
```

## 🔍 Debugging Techniques

### Enable Debug Mode
```typescript
RATM.initialize({
  debug: true,  // Enables logging
  // ... other options
})
```

### Check State in Runtime
```typescript
// In browser console
console.log(RATM.getState())
console.log(RATM.getTrack(0)?.getState())
console.log(RATM.getTrack(0)?.getStream())
```

### Common Issues

**Audio won't play**
- Check browser autoplay policy
- Verify audio source URL is valid
- Check if track is muted
- Check master volume level
- Look for errors in console

**Queue not advancing**
- Check `autoPlay` is true
- Verify `onEnd` callback is firing
- Check for the index 0 bug (see ISSUES.md)

**State not updating in React**
- Verify hook is used inside component
- Check if AudiotrackManager is initialized
- Ensure no render optimization blocking updates

## 📦 Build & Publish Workflow

### Local Development
```bash
# Build library
pnpm build

# Lint (TypeScript check)
pnpm run lint

# Test example app
cd example
pnpm install  # If first time
pnpm dev
```

### Publishing (Maintainers)
```bash
# 1. Make changes
# 2. Create changeset
pnpm changeset

# 3. Select version bump type
# - patch: bug fixes
# - minor: new features (backward compatible)
# - major: breaking changes

# 4. Commit changeset file
git add .changeset/*
git commit -m "chore: add changeset"

# 5. Push and create PR
# 6. Changeset bot will create version PR
# 7. Merge version PR to publish
```

## 🧪 Testing Checklist

**Before committing**:
- [ ] TypeScript compiles: `pnpm run lint`
- [ ] Library builds: `pnpm build`
- [ ] Example app works: `cd example && pnpm dev`
- [ ] No console errors in browser
- [ ] Test audio registration
- [ ] Test play/pause controls
- [ ] Test volume controls
- [ ] Test track switching
- [ ] Test caption display (if applicable)

**Manual test scenarios**:
1. Register multiple audios on one track
2. Register audios on different tracks concurrently
3. Test priority insertion
4. Test skip functionality
5. Test loop functionality
6. Test mute/unmute
7. Test master volume changes
8. Test global mute
9. Test with `allowDuplicates: false`
10. Test subtitle synchronization

## 🚨 What NOT to Do

1. **Don't add new dependencies** without discussion
2. **Don't change public API** without major version bump
3. **Don't remove exports** - breaking change
4. **Don't commit console.log** unless behind debug flag
5. **Don't use `any` type** - defeats TypeScript purpose
6. **Don't skip testing** - breaks things for users
7. **Don't refactor without reason** - introduces risk
8. **Don't ignore TypeScript errors** - they exist for a reason

## 💡 Pro Tips

1. **Use example app for testing** - It's comprehensive
2. **Check existing patterns first** - Maintain consistency
3. **Read the whole file** before editing - Context matters
4. **Small PRs are better** - Easier to review
5. **Add TODO comments** for follow-up work
6. **Update types first** - Drives implementation
7. **Consider backward compatibility** - Users depend on this

## 📞 When Stuck

1. Check existing implementation for similar features
2. Read TypeScript error messages carefully
3. Test in example app with debug mode
4. Check browser console for runtime errors
5. Review type definitions in `types.ts`
6. Look at how hooks subscribe to state changes

## 🎓 Learning Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Hooks**: https://react.dev/reference/react
- **HTMLAudioElement**: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
- **Observer Pattern**: Understanding state management pattern used
- **tsup**: https://tsup.egoist.dev/

---

## Quick File Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/AudiotrackManager.ts` | Global state & API | Adding global features |
| `src/Track.ts` | Track management | Track-level features |
| `src/AudioItem.ts` | Audio wrapper | Audio element features |
| `src/types.ts` | Type definitions | Adding new types/options |
| `src/useAudiotracks.ts` | Global state hook | Rarely needed |
| `src/useTrackStream.ts` | Track stream hook | Rarely needed |
| `src/utils.ts` | Utility functions | Adding helpers |
| `src/constants.ts` | Default values | Changing defaults |
| `index.ts` | Public exports | Exposing new APIs |
| `package.json` | Dependencies & scripts | Adding deps/scripts |
| `tsconfig.json` | TypeScript config | Build settings |
| `README.md` | User documentation | Documenting features |

---

**Remember**: The goal is to maintain a high-quality, reliable audio library. Quality over speed. Test thoroughly. Document clearly. Keep it simple.
