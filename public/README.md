# Brand assets

`fi911-logo-source.svg` is the file supplied by the client — an SVG wrapper
around a 409×106 PNG. It is kept as the source of record and is **not** served
to the app.

The four assets the app actually references, all cut from that source:

| File | Used by | Notes |
|---|---|---|
| `fi911-logo.png` | Login panel, light surfaces | Full lockup, original colours |
| `fi911-logo-white.png` | Navigation rail | Dark navy → white; teal untouched |
| `fi911-mark.png` | — | Badge only, original colours |
| `fi911-mark-white.png` | Collapsed rail | Badge only, inverted |

The inverse is a real second asset rather than a CSS filter over the first: the
wordmark's dark navy (`#071F28`) has to become white while the teal (`#00AAB4`)
stays teal, and no single filter does both.

The badge/wordmark seam is at x=112 in the source — the columns between 105 and
120 are fully transparent, so that is the clean cut.

Paths are set in `src/brand/brand.config.js` and reach the DOM as strings; no
component imports an image. Swapping tenants swaps a path.
