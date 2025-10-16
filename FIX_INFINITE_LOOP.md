# Fix: Maximum Update Depth Exceeded Error

## Problem
The `useQuests` hook was throwing the error:
```
Maximum update depth exceeded. This can happen when a component calls setState 
inside useEffect, but useEffect either doesn't have a dependency array, or one 
of the dependencies changes on every render.
```

## Root Cause
The `useEffect` that loads quests from the contract had `completedQuests` and `inProgressQuests` in its dependency array:

```typescript
useEffect(() => {
  // ... load quests logic
}, [
  isConnected,
  questIds,
  questsLoading,
  questsSuccess,
  questsData,
  completedQuests,      // ❌ Problem: Set object recreated every render
  inProgressQuests,     // ❌ Problem: Set object recreated every render
]);
```

**Why this caused the issue:**
1. `completedQuests` and `inProgressQuests` are `Set` objects managed by state
2. Every time the hook re-renders, `setQuests()` is called
3. This causes the component to re-render
4. On re-render, new `Set` objects are created (even though the values are the same)
5. Since the dependencies changed (new Set instances), the `useEffect` runs again
6. This triggers more state updates, causing another re-render
7. **Loop continues infinitely** → "Maximum update depth exceeded"

## Solution
Use `useRef` to track the quest status objects without triggering re-renders:

```typescript
// Store refs that don't trigger re-renders
const completedQuestsRef = useRef<Set<string>>(new Set());
const inProgressQuestsRef = useRef<Set<string>>(new Set());

// Update refs whenever the actual state changes
useEffect(() => {
  completedQuestsRef.current = completedQuests;
  inProgressQuestsRef.current = inProgressQuests;
}, [completedQuests, inProgressQuests]);

// Use refs inside the load effect (not the state objects)
useEffect(() => {
  // ... load logic using completedQuestsRef.current, inProgressQuestsRef.current
}, [
  isConnected,
  questIds,
  questsLoading,
  questsSuccess,
  questsData,
  // ✅ No longer including the Set objects themselves
]);
```

**Why this works:**
1. `useRef` returns the same object reference every render
2. The refs are updated whenever the state changes
3. Inside the effect, we use `completedQuestsRef.current` (the ref, not the state)
4. The dependency array doesn't change when the underlying Set values change
5. **No infinite loop** → error is fixed

## Additional Changes
- Added `questsProcessedRef` flag to prevent processing the same quests multiple times
- Removed unused `questIdsLoading` variable
- Simplified dependency array for the main load effect

## Testing
✅ App should now load without the "Maximum update depth exceeded" error
✅ Quests load from contract correctly
✅ Quest status persists to localStorage
✅ Switching between connected/disconnected states works

---

**Commit:** da9d8cf
**File:** `frontend/src/hooks/useQuests.ts`
**Status:** ✅ Fixed
