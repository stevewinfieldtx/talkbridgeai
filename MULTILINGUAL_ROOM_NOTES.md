# TalkBridge — Multilingual Room (Future Build)
## Date: April 6, 2026
## Status: PARKED — Come back to this

## Concept
Multi-person translation room. 4+ people, each speaking their own language.
When one person speaks, everyone else hears the translation in THEIR language on THEIR device.

## Architecture Decisions
- Build on TalkBridge v1 (the WORKING app), NOT TranslatePipe (never worked)
- Push-to-talk model (spacebar or tap to claim the mic)
- When one person has the mic, everyone else's mics go RED
- Visual display of all participants — see who has the mic (flag/name lit up)
- Each person joins a room, declares their language
- Server handles: STT of speaker → translate to each listener's language → push translation to each listener
- Each listener's device speaks the translation via TTS

## UI Ideas
- Room code to join (like TranslatePipe had)
- Grid of participant cards showing name + flag + mic status
- Active speaker's card lights up (green border, flag highlighted)
- Everyone else's cards show red/muted
- Subtitles/transcript feed below showing translations

## Technical Notes
- Server-side relay (like TranslatePipe-Relay pattern but built fresh)
- One Speechmatics STT session per active speaker (not per person — only the speaker needs STT)
- Google Translate for N-1 translations (one per listener language)
- Browser TTS or ElevenLabs on each client for speaking the translation
- WebSocket room management: join, leave, claim-mic, release-mic events
- Could deploy on Railway (relay server) + Vercel (frontend)

## Key Difference from TranslatePipe
- TranslatePipe was two-person, each with their own Speechmatics session
- This is N-person, push-to-talk, only ONE active speaker at a time
- Much simpler audio routing — no cross-talk, no echo issues
- Speaker claims mic → everyone else listens

## Open Questions
- Max participants? (Speechmatics concurrent session limit is 50, so not an issue)
- Do we need video? Or audio-only translation room?
- Mobile-first or desktop-first?
- Room persistence (ephemeral like TranslatePipe, or persistent with auth?)
