# WKND Adventures — Project State

**Original site:** https://wknd-adventures.com/
**Local preview:** http://localhost:3000/content/{page}

---

## Blocks (12 total) + Section Styles

Mix of standalone blocks and block families with CSS variants.

| Block | Variants | CSS Notes |
|-------|----------|-----------|
| `hero` | `article` | Full-bleed overlay hero. Base (no variant) = landing pages with eyebrow, gradient overlay, CTA buttons. `article` = blog posts with breadcrumbs, tag pills, author avatar. |
| `cards` | `cards-article`, `cards-feature` | `cards-article` = image+body grid with hover effects. `cards-feature` = glass text-only cards (dark section). Shared internal classes: `cards-card-image`, `cards-card-body`. |
| `columns` | `columns-about`, `columns-promo`, `columns-pullquote` | 3 variants in one file. `columns-promo` uses `:has()` for narrow container. `columns-pullquote` has pull-quote dark panel. Shared internal class: `columns-img-col`. |
| `featured-article` | _(none)_ | Standalone block. Image + content side-by-side with tag pill, CTA button. Internal class: `featured-article-img-col`. |
| `editorial-index` | _(none)_ | CSS-only block. Numbered items with large accent numbers. Grid layout: number + content. |
| `tabs` | _(section style)_ | **Not a block** — section style in `lazy-styles.css`. Consecutive sections with `style: tabs` are grouped into a tabbed container by `decorateTabSections()` in `scripts.js`. Each panel is a full section that can contain any blocks. |
| `team-profile` | _(none)_ | Standalone block. Circular avatar + name/role + bio. Typically nested inside `tabs` on team pages. |
| `gallery` | _(none)_ | CSS-only block. Photo grid. |
| `faq-list` | _(none)_ | Uses native `<details>/<summary>` with animated open/close. |
| `ticker` | _(none)_ | Horizontal scrolling tag ticker. |
| `header` | _(none)_ | Sticky nav bar with megamenu (3 panels: Explore, Stories, Info). Desktop hover+click, mobile hamburger. |
| `footer` | _(none)_ | Dark 4-column layout: brand+tagline, Explore links, Recent Stories links, Info links + bottom bar. |

### Block variant CSS selectors

```
.hero { ... }                     /* base hero (full-bleed overlay) — no variant needed */
.hero.article { ... }             /* variant for blog article pages */
.cards.cards-article { ... }
.cards.cards-feature { ... }
.columns.columns-about { ... }
.columns.columns-promo { ... }
.columns.columns-pullquote { ... }
.featured-article { ... }         /* standalone block */
.editorial-index { ... }          /* standalone block */
.faq-list { ... }                 /* standalone block */
.team-profile { ... }             /* standalone block, nestable in tabs */
```

### Container-level variant targeting

EDS generates `{block}-container` and `{block}-wrapper` divs using the **base** block name only. To target container/wrapper for a specific variant, use `:has()`:

```css
.columns-wrapper:has(.columns-promo) { max-width: var(--container-narrow-max-width); }
```

---

## Section Styles

Three background variants and two compound modifiers:

| Style | CSS Class | Effect |
|-------|-----------|--------|
| `dark` | `.section.dark` | Dark green bg (#0f1a14), white text |
| `accent` | `.section.accent` | Orange bg (#e8651a), dark text |
| `secondary` | `.section.secondary` | Warm beige bg (#f0ece4), default text |
| `narrow` | `.section.narrow` | Constrains content to 768px max-width |
| `center` | `.section.center` | Centers text and buttons |

Compound styles are comma-separated in section-metadata (e.g., `dark, narrow` or `accent, center`). Modifiers can also be used standalone (e.g., just `narrow`).

---

## Design Tokens (styles.css)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--background-color` | `#fff` | Page background |
| `--text-color` | `#0f1a14` | Body text |
| `--text-color-muted` | `#7a8a80` | Gray-500, secondary text |
| `--text-color-subtle` | `#3d4f45` | Gray-400 |
| `--accent-color` | `#e8651a` | Orange accent, buttons |
| `--light-color` | `#f0ece4` | Secondary section bg |
| `--dark-color` | `#0f1a14` | Dark section bg, headings |
| `--cream-color` | `#f5f0e8` | Card hover bg |
| `--forest-color` | `#1a3a2e` | Deep green accent |
| `--border-color` | `#c8c2b8` | Gray-300, hover borders |
| `--border-color-light` | `#ddd8cf` | Gray-200, default borders |

### Typography
| Token | Value |
|-------|-------|
| `--body-font-family` | Instrument Sans |
| `--heading-font-family` | Syncopate |
| `--button-font-family` | Syncopate |

### Spacing
| Token | Value |
|-------|-------|
| `--container-max-width` | 1200px |
| `--container-narrow-max-width` | 768px |
| `--container-padding` | 0 24px |
| `--section-padding` | 48px 0 (mobile), 64px 0 (desktop) |
| `--gap-sm` | 8px |
| `--gap-md` | 16px |
| `--gap-lg` | 24px |
| `--gap-xl` | 32px |
| `--gap-2xl` | 48px |
| `--gap-3xl` | 64px |

### Links
| Token | Value |
|-------|-------|
| `--link-color` | #e8651a |
| `--link-hover-color` | #c9530e |

### Shared Component Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--card-border-radius` | `20px` | Cards, columns-promo, pullquote, gallery, featured-article |
| `--card-hover-shadow` | `0 4px 20px rgb(0 0 0 / 8%)` | Hover shadow on cards, promo |
| `--card-hover-transition` | `background-color 0.15s, border-color 0.15s, box-shadow 0.15s` | Shared card hover transition |
| `--tag-padding` | `5px 8px 3px` | Tag pill padding — asymmetric for optical centering of uppercase text |
| `--tag-font-size` | `10.4px` | Tag pill font size |
| `--tag-letter-spacing` | `0.52px` | Tag pill letter spacing |
| `--text-on-dark` | `rgb(255 255 255 / 85%)` | Paragraph text on dark backgrounds |
| `--text-on-dark-muted` | `rgb(255 255 255 / 55%)` | Secondary text on dark backgrounds |
| `--glass-bg` | `rgb(255 255 255 / 6%)` | Glass card background (dark sections) |
| `--glass-border` | `rgb(255 255 255 / 12%)` | Glass card border (dark sections) |
| `--transition-fast` | `0.15s` | Quick interactions (hover, border) |
| `--transition-normal` | `0.3s ease` | Standard transitions (transform, accordion) |

### Buttons
Primary (black + amber shadow), Ghost (outline + amber shadow), Accent (amber + white shadow). In accent sections, `--btn-shadow` overrides to `#fff`. All use offset `box-shadow` with hover lift and active press-down transitions.

---

## Import Infrastructure

### Import Script (tools/importer/)
Single unified import script (`import.js`) with content-driven block detection via `BLOCK_REGISTRY`.

### Parsers (tools/importer/parsers/) — 14 files
`hero-full.js`, `hero-article.js`, `featured-article.js`, `editorial-index.js`, `columns-gallery.js`, `columns-about.js`, `columns-sidebar.js` (outputs `columns-pullquote`), `columns-promo.js`, `cards-article.js`, `cards-feature.js`, `tabs-activity.js`, `tabs-team.js`, `faq-list.js`, `ticker.js`

Parser output names (what goes into content HTML):
- `Hero` → `class="hero"` (base hero, no variant — used on all landing/hub/info pages)
- `Hero (article)` → `class="hero article"`
- `Cards (cards-article)` → `class="cards cards-article"`
- `Cards (cards-feature)` → `class="cards cards-feature"`
- `Featured Article` → `class="featured-article"` (standalone block)
- `Editorial Index` → `class="editorial-index"` (standalone block)
- `Columns (columns-about)` → `class="columns columns-about"`
- `Columns (columns-promo)` → `class="columns columns-promo"`
- `Columns (columns-pullquote)` → `class="columns columns-pullquote"`
- `Gallery` → `class="gallery"`
- Tabs → section style `tabs` (consecutive sections grouped into tabbed container)
- `Team Profile` → `class="team-profile"` (used inside tabs sections on about page)
- `Faq List` → `class="faq-list"` (standalone block)
- `Ticker` → `class="ticker"`

### Transformers (tools/importer/transformers/)
- `wknd-cleanup.js` — removes nav, footer, scripts, etc.
- `wknd-sections.js` — creates section boundaries with section-metadata

### Bundling
```bash
npx esbuild tools/importer/import.js \
  --bundle --format=iife --global-name=CustomImportScript \
  --platform=browser --outfile=tools/importer/import.bundle.js
```
**Critical:** Must use `--format=iife --global-name=CustomImportScript`. ESM format will fail.

### Running imports
```bash
node /home/node/.excat-marketplace/excat/skills/excat-content-import/scripts/run-bulk-import.js \
  --import-script tools/importer/import.bundle.js \
  --urls tools/importer/urls.txt
```

### Nav and footer import scripts

Separate import scripts for the nav and footer fragments (not part of the main page import since they're site-wide fragments, not individual pages):

- `tools/importer/import-nav.js` — parses the original site's navbar and produces the EDS nav fragment structure (brand + megamenu sections + subscribe CTA)
- `tools/importer/import-footer.js` — parses the original site's footer and produces the EDS footer fragment structure (brand column + link columns + copyright)

Bundle and run the same way as the main import script:
```bash
npx esbuild tools/importer/import-nav.js \
  --bundle --format=iife --global-name=CustomImportScript \
  --platform=browser --outfile=tools/importer/import-nav.bundle.js

# Run against any page on the source site (nav/footer are global)
echo "https://wknd-adventures.com/index.html" > /tmp/url.txt
node run-bulk-import.js --import-script tools/importer/import-nav.bundle.js --urls /tmp/url.txt
```

**Note:** The nav/footer import output may flatten the section structure (all content in one `<div>` instead of separate section `<div>`s). The hand-crafted files in `/content/` have the correct multi-section structure needed by `header.js` and `footer.js`.

---

## Block JS — DOM Restructuring Notes

### hero.js
The hero block restructures the EDS table DOM into a full-bleed background image layout:
- **Input:** 2-row table → `block > div(row) > div(cell) > p > img` (image row) + `block > div(row) > div(cell) > [content]` (content row)
- **Output:** `block > picture > img` (absolute-positioned background) + `block > div` (content overlay with z-index)
- The JS extracts `<img>` from the first row, wraps it in a new `<picture>`, then calls `block.replaceChildren(picture, contentCell)`.
- Images arrive inside `<p>` tags (not `<picture>`) because EDS only auto-wraps direct-div-child images in `<picture>`.

### columns.js
Detects image-only columns and adds `columns-img-col` class:
- **Primary check:** `col.querySelector('picture')` — for images that EDS has wrapped in `<picture>`
- **Fallback check:** `col.querySelector(':scope > p > img')` — for images inside `<p>` tags (typical from imports)
- Without this fallback, image columns don't get the `columns-img-col` class, breaking about/promo/pullquote layouts.

### featured-article.js
Same image detection pattern as columns.js but uses `featured-article-img-col` class.

### team-profile.js
Detects avatar image column and adds `team-profile-avatar` / `team-profile-text` classes.

### Tabs (section style — no block JS)
Tabs are handled by `decorateTabSections()` in `scripts.js`, not by a block. Consecutive sections with `style: tabs` are grouped into a `.tabs-container` div. The first heading in each section becomes the tab label. CSS is in `styles/lazy-styles.css`. The sliding indicator animates between tabs with an asymmetric ease (leading edge moves first).

---

## Block CSS — Implementation Notes

### editorial-index
- Uses `border-top` on all items + `border-bottom` only on `:last-child` to avoid double borders between adjacent items.
- Number column: 48px (mobile) / 56px (desktop) Syncopate font, amber color.
- Desktop grid: `80px 1fr`.

### featured-article
- Image column uses `overflow: hidden` + `max-height` (20rem mobile, 400px desktop) with `object-fit: cover` to constrain images that are inside `<p>` wrappers.
- Tag pill targets `p:first-child` in content column (imported content uses `<p>Water</p>` not `<em>Water</em>`). Also supports `em` for future content corrections.
- "Read the Story" link is styled as a dark button via block CSS since imported content lacks `<strong>` wrapper for EDS button decoration.
- Footer layout: button paragraph uses `text-align: right`.

---

## Notes

- **Nav/footer content:** Lives at `/content/nav.plain.html` and `/content/footer.plain.html`. The `getContentRoot()` utility in `scripts.js` resolves the fragment path dynamically based on the page URL.
- **Bundle files:** `.bundle.js` files are generated by esbuild and excluded from eslint via `.eslintignore`.
- **`moveInstrumentation`:** Does not exist in this project. Do NOT import it in block JS files.
- **Fragment block:** A utility block — `blocks/fragment/fragment.js` exports `loadFragment()` used by `header.js` and `footer.js`. Not used in content but must not be deleted.
