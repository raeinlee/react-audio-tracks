---
"react-audio-tracks": patch
---

Fixed issues: queue clearing logic error preventing items at index 1+ from being removed, uuid generation producing undefined values on rare cases where Math.random hits near zero
