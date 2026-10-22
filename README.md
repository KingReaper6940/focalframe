# Focalframe

**Keep what matters in every frame.**

Set one focal point, then compare square, portrait, and wide crops side by side. Export full-resolution images, save a reusable crop recipe, or prepare a labelled comparison sheet for a creative handoff. Everything runs locally in the browser.

## Features

- **Three live crops:** square (1080 × 1080), portrait (1080 × 1350), and wide (1600 × 900).
- **Manual focal control:** click the original, use the horizontal/vertical sliders, or move the point with the keyboard.
- **Explicit upscaling:** exports that need enlargement are blocked unless you allow it.
- **PNG and JPEG:** preview the actual encoded image before saving; JPEG uses a white background.
- **Comparison sheet:** export a labelled 1800 × 1000 PNG showing all three crops together.
- **Portable recipes:** save focal coordinates, source dimensions, output format, and the upscaling setting as JSON.
- **Inspectable math:** see the exact source-pixel crop rectangles and scale factors.
- No account, uploads, analytics, external fonts, backend, or runtime dependencies.

## Run locally

Requires Node.js 20 or newer. No dependency installation is needed.

```sh
git clone https://github.com/KingReaper6940/focalframe.git
cd focalframe
npm run dev
```

Open **http://127.0.0.1:4182**. The demo is a deterministic scene drawn in code, so you can explore every feature without opening a personal photo.

1. Choose **Open image** for a PNG, JPEG, or WebP, or keep the demo.
2. Click the original or adjust **Horizontal focus** and **Vertical focus**.
3. Use **Crop guide** to see one format's crop window on the original. All three output previews update regardless of which guide is selected.
4. Choose PNG or JPEG, then select **Prepare square/portrait/wide export**.
5. Inspect the prepared image, its dimensions, file type, and encoded size. Use the download link to save it.

Preparing another export replaces the previous one. Changing the source, focal point, guide, format, or upscaling setting clears the prepared export so an old file cannot be mistaken for the new crop.

### Keyboard control

Focus the original image. Arrow keys move the focal point by 1%; hold Shift to move by 5%. Enter or Space resets to the center. The labelled sliders offer an alternative keyboard control. The point is constrained to the image boundaries.

## Cropping rules

The tool uses the largest source rectangle with the output's aspect ratio, centered on the focal point where possible. It shifts the rectangle back inside the image when it reaches an edge. It resizes that crop proportionally: it never stretches the picture or adds generated content.

A point near an edge may not appear in the center of the result because there are no pixels beyond that edge. A focal point does not describe a person's full body, an object boundary, or a text-safe region. Review every format.

These are generic fixed output formats, not a promise to track any social platform's current specifications.

### Upscaling

If the source crop is smaller than its requested output, that individual export is disabled by default. Enable **Allow upscaling** to permit it. A warning remains because more pixels do not create more detail.

Preview canvases are smaller than exported files. The comparison sheet uses thumbnail crops and labels the intended target sizes; it does **not** bundle three full-resolution images. Comparison sheets are always PNG with a white image background, independent of the selected individual export format.

## Recipes and examples

**Save crop recipe** downloads JSON containing the source dimensions and crop settings. The image itself is not included. Reopen the original image, then choose **Open recipe**.

Dimension mismatches are rejected. Matching dimensions do not prove file identity: another image of the same size can accept the recipe. No image hashes or filenames are recorded.

The [demo recipe](examples/demo-recipe.json) uses a 2400 × 1600 source with a focal point of 72% horizontal and 50% vertical. Its [computed report](examples/demo-report.json) describes:

| Crop | Source rectangle (x, y, width, height) | Output |
| --- | --- | --- |
| Square | 800, 0, 1600, 1600 | 1080 × 1080 |
| Portrait | 1088, 0, 1280, 1600 | 1080 × 1350 |
| Wide | 0, 125, 2400, 1350 | 1600 × 900 |

Regenerate these examples with `node scripts/examples.mjs`. Source coordinates may contain fractional pixels for other images; Canvas performs the raster sampling.

## Limitations

- One image at a time. No batch imports, subject detection, freeform crop-box resizing, rotation, text overlays, or animation controls.
- Inputs: PNG, JPEG, or WebP, up to **10 MiB**, **8,000 pixels per side**, and **16 megapixels**. File type and size are checked before decoding; pixel dimensions are checked after browser decoding. Decoding may use additional transient memory.
- Outputs: PNG or JPEG at the three fixed dimensions. JPEG is encoded with a 0.9 quality hint; results vary by browser. Unsupported encoder fallback is rejected rather than downloaded with the wrong file extension.
- Browser decoding handles image orientation and color conversion. This is not a color-managed proofing tool or a metadata-preserving editor.
- PNG export keeps source transparency; JPEG composites it over white.
- Recipes are version 1 JSON, limited to 10,000 JavaScript string characters (with an additional 40 KB file-read cap).
- Images/settings are not stored automatically. Reloading starts the demo again. Download a recipe to retain settings, and keep the source image separately.

## Privacy

Image files are decoded through browser APIs and rendered in Canvas. The app makes no data requests after loading its static assets; its Content Security Policy blocks connections. There are no storage APIs, cookies, analytics, or remote image URLs.

Raw image data remains in page memory while you work. Browser extensions, the operating system, and a host serving altered code are outside the app's control. Downloads create files outside the app. No claim is made that this tool securely erases memory or scrubs all identifying image content.

## Tests and build

```sh
npm test
npm run build
```

The 12 Node tests cover crop geometry, focal-point containment, source bounds, aspect-ratio preservation, upscaling gates, input limits, immutability, recipe normalization/round trips, and encoder error/fallback handling. Encoder failure tests use controlled Canvas substitutes; real encoding was checked separately in the browser.

Browser verification produced an actual 1080 × 1080 PNG, a 1080 × 1350 JPEG, and an 1800 × 1000 comparison PNG. Decoded image dimensions and download filenames were inspected. Demo crop rectangles matched the documented example; keyboard movement and stale-export clearing were checked. A 390px viewport had no page-level horizontal overflow. Native file chooser/recipe import and the final downloaded-file path have not been verified end-to-end.

A real application screenshot was captured for visual inspection, but writing the screenshot artifact was blocked in the verification environment. No screenshot file or illustrative mockup is presented as a committed application screenshot.

GitHub Actions runs tests and builds on Node 20/22 on Windows/Linux. The static build checks browser-module syntax and copies the app to `dist/`.

## Manual Vercel deployment

Import this GitHub repository with:

| Setting | Value |
| --- | --- |
| Framework | Other |
| Root directory | `./` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | Empty; no dependencies |

`vercel.json` includes these settings. No environment variables, database, server functions, or paid APIs are required. No live deployment URL is advertised. You can also serve `dist/` on another static host that serves `.mjs` files as JavaScript.

## Structure and references

`src/core.mjs` holds pure crop planning. `src/recipe.mjs` validates recipe files. `src/raster.mjs` draws and encodes exports. `src/demo.mjs` creates the original demo artwork, and `src/app.mjs` coordinates local UI state and invalidates stale exports.

The implementation uses [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) and [Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob). Crop computation and manual focal control are independent of any hosted image service.

MIT licensed. See [LICENSE](LICENSE).
