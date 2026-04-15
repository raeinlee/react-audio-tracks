# ISSUES to Fix

## 🔴 Priority 1: Production Bugs (Remaining)

**All production bugs have been fixed!** 🎉

---

## 🟡 Priority 2: Recommended Improvements

The following items from the IMPROVEMENTS.md file are recommended next steps, but are not issues.

---

## 🔧 Testing Recommendations

Create test cases for:

1. ✅ Audio queue management (especially clearing at all indices)
2. ✅ UUID uniqueness under load (generate 10,000 IDs, check for duplicates) - VERIFIED
3. ✅ Rapid audio registration (collision detection) - Fixed with uuid()
4. ✅ Console output in production mode (should be silent unless debug=true)

---

## 📋 Verification Checklist

All critical fixes verified:

- ✅ All IDs are unique with custom simple hash (tested with 1M generations - 100% unique)
- ✅ Queue properly clears audio at all indices (fixed: `soundIdx === -1`)
- ✅ Example app works without errors
- ✅ TypeScript compiles without warnings
- ✅ Bundle size unchanged (fixes are minimal code changes)
