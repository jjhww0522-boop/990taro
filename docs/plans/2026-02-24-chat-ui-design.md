# Chat UI + Tarot Card Design (2026-02-24)

## Goal
- Implement a full-screen chat interface and a reusable tarot card component matching a deep oriental occult mood.
- Keep existing `src/app/api/*` structure intact and render new UI from `src/app/page.tsx`.

## Visual Direction
- Dark ink-paper base (`occult-bg-main`) with subdued card surfaces (`occult-bg-card`).
- Cinnabar-red accents (`occult-accent`) for borders, active controls, and symbolic ornaments.
- No neon/cyberpunk elements; maintain solemn ritual-like atmosphere.

## Components
- `src/components/TarotCard.tsx`
  - 3D flip using Framer Motion with front/back faces.
  - Back face: occult frame + red sigil-like motif.
  - Front face: placeholder art, card title/subtitle.
  - Support `isReversed` orientation and compact composite badges (five elements / zodiac / four symbols).
- `src/components/ChatBoard.tsx`
  - Full viewport chat layout.
  - Scrollable message area + fixed bottom composer.
  - Initial assistant message with typewriter reveal.
  - Includes a sample tarot reveal block using `TarotCard`.

## Interaction + Accessibility
- Respect `prefers-reduced-motion` by shortening/removing non-essential animation.
- Maintain touch-friendly control sizes and visible focus rings.
- Mobile-safe composer with `100dvh` layout and bottom safe-area padding.

## Performance Notes
- Keep page as server component and move interactive logic to client component (`ChatBoard`).
- No heavy assets; use CSS gradients/patterns for placeholder visuals.
