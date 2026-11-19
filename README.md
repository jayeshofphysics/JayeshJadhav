# Jayesh Jadhav — Video-reference Portfolio

A second, independent portfolio for an experimental physicist, built in the style of the shared Aswin portfolio video.

## Design

- Very dark editorial layout with compact floating navigation.
- Code-textured full-screen hero and oversized experimental-physicist heading.
- Three-column introduction, tech stack, stacked folder project cards, and curved research timeline.
- Accessible project detail dialogs and simple contact mailto draft.
- Black-and-white illustrated crowd footer, with stationary central researcher and separate animated rows.

The central illustration is an **original symbolic character**, **not an actual photograph or likeness** of Jayesh. Imagery and Raman chart are illustrative, not experimental measurements. The video is a visual reference; the source implementation and artwork are original.

## Files

- `index.html` — page markup
- `styles.css` — responsive design and animations
- `script.js` — navigation, project dialogs, form draft, and crowd animation
- `assets/` — illustration/visual assets and CV

## Local preview

Run `python -m http.server 8000` in the project root and visit `http://localhost:8000`.

## GitHub Pages

Deploy from `main` branch, `/ (root)`, in Settings → Pages. This project intentionally does not modify `jayeshofphysics/JayeshJadhav`.

## Accessibility

- Keyboard accessible navigation, menu, cards, and dialogs.
- Crowd pause/resume, offscreen pausing and document visibility pausing.
- `prefers-reduced-motion` support.
- Mobile and tablet responsive layouts.
