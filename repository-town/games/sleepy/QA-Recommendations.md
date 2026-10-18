# Sleepy QA Recommendations

This document records the QA audit findings for Sleepy and the recommended changes to make the bedtime companion safer, more sleep-friendly, and family aligned.

## Key Audit Findings
- The app uses YouTube embeds and long videos, which conflicts with bedtime screen-free guidance.
- There is no true lights-out mode or fade-to-audio transition.
- There is no session timer or closing ritual.
- Tap targets and offline fallbacks are weak on mobile.
- No parent gate or age-based warning system.
- External links and video recommendations introduce privacy and copyright risks.

## Recommendations
1. Replace YouTube embeds with local or licensed audio-first content.
   - Curate short lullabies and stories under 30 minutes.
   - **Acceptance**: no external YouTube URLs remain; media is playable offline.

2. Add a lights-out mode.
   - Fade the screen to black and continue audio-only playback.
   - **Acceptance**: the display dims to <20% and transitions to audio within 30 seconds.

3. Add a session timer and closing ritual.
   - After 10 minutes of content, prompt the caregiver to move to an offline bedtime routine.
   - **Acceptance**: the app automatically asks to close the screen and read a real book.

4. Add screen-free reminders and parent gates.
   - Warn when the child is under 2 or when usage is near bedtime.
   - Require a caregiver confirmation before playing media.
   - **Acceptance**: media cannot start without a long press or parent confirmation.

5. Improve mobile UX and offline handling.
   - Increase thumbnail tap areas, offer a true dark mode, and provide fallback messaging offline.
   - **Acceptance**: the site works with clear fallback content when offline.

## Implementation Notes
- Keep any Christian or family-based content optional and age-appropriate.
- Avoid autoplay and algorithmic recommendations.
- Prioritise audio-first stories over visual video playback.

## Suggested Roadmap
- `P1`: remove YouTube, add audio library and fade-to-audio
- `P2`: add timer and closing ritual, parent gate
- `P3`: add offline fallback, dark mode and accessibility support

## Status
- [ ] Replace external video embeds with local audio content
- [ ] Add lights-out fade and audio-only mode
- [ ] Add session timer and offline bedtime transition
- [ ] Add parent gate and bedtime warning
- [ ] Improve mobile tap targets and offline fallback

## Appendix: Audit & Research Excerpts
### QA Audit for Child Apps (relevant Sleepy findings)
- Sleepy’s reliance on YouTube, bright screens and lengthy videos conflicts with paediatric sleep science and introduces copyright risks.
- The site offers breathing exercises and “Dim lights,” but most videos are embedded from YouTube and can include ads, external recommendations, and copyrighted Disney clips.
- Missing supports: no true screen lock, no session timer, no automatic fade to audio-only mode, no integration of co-regulation prompts, no transition to offline books.
- Recommendations excerpt: replace YouTube embeds with locally hosted or licensed audio-only stories and music; enforce a lights-out mode; limit content length to under 30 minutes; add a session timer and closing ritual; provide bedtime warnings and parent gate.

### SylvieElias_AppDesign_Research (relevant Sleepy findings)
- Blue light and melatonin: screen light suppresses melatonin production and can delay sleep onset by 30–60 minutes in preschoolers; remove screens at least 45–60 minutes before sleep.
- Bedtime app design principles: warm amber display (<3000K), brightness auto-reduced to 20–30%, and audio-first content are preferred.
- Pacing: slow, low-variability audio near 60–80 BPM with calm narrator voice.
- Content type: non-stimulating narrative, nature imagery, and no problem-solving or exciting content.
- Consistency: bedtime routine structure should be opening ritual → content → closing ritual → parent handoff.
- Critical guideline: for children under 2, zero passive screen time is recommended; if Elias is present, transition him first or position him away from the screen.

### Evidence-based guidance for Sleepy
- Screen-free window: no screens 45–60 minutes before designated sleep time; treat Sleepy as the transition signal rather than the final step.
- Audio-first design: consider a lights-out mode where the screen fades to black and only audio continues.
- Avoid algorithmic recommendations and external links; curated audio content is safer and more sleep-friendly.
- The routine matters more than a single content choice. Sleepy should offer a consistent structure and a parent handoff at the end.
