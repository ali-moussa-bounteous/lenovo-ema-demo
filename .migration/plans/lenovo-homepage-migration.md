# Lenovo Homepage and Key Pages Migration Plan

## Goal
Move the Lenovo US English homepage, plus a few representative pages, into this site. The Lenovo homepage will **replace** the current WKND Adventures homepage. The Commerce add-on will be turned on so product listing and product detail pages can be migrated properly.

## Decisions Confirmed
| Topic | Decision |
|---|---|
| Scope | Homepage plus a few key pages that I'll suggest and you'll approve |
| Homepage target | Replace the existing WKND homepage |
| Commerce add-on | Turn it on |
| Source locale | Lenovo US English (`www.lenovo.com/us/en/`) |

## Approach
1. **Turn on the Commerce add-on first.** It becomes usable from the next message, so this is the only thing I'll do in the first step.
2. **Homepage.** It's a marketing page, not a product page, so it uses the standard page migration: analyse the page, pick blocks and variants, build the import script, import the content and style it.
3. **Key pages.** I'll find the site's page list and suggest 3–4 representative pages, for example Laptops, Deals and a ThinkPad series page. After you approve them, I'll sort each one:
   - Marketing or landing pages → standard migration, reusing the homepage's blocks and variants where they match.
   - Product listing or product detail pages → Commerce migration.
4. **Replace the homepage.** The Lenovo homepage will be saved as the site's main homepage in place of the WKND one. The existing WKND blocks will stay in place, because the header and footer depend on them. New Lenovo blocks and variants will be added next to them.
5. **Check the preview.** I'll compare each migrated page with the original Lenovo page and fix any major layout or styling differences.

## Risks and Notes
- **Bot protection:** Lenovo uses strong anti-bot protection. If a normal scrape is blocked, the scrape will switch to the fallback method automatically.
- **Folder-style URLs:** Lenovo addresses end in `/` (for example `/us/en/`). The importer needs an explicit page path, so the homepage address and its output location will be set so the page lands on the main homepage.
- **Dynamic content:** Prices, stock levels, personalised offers and content loaded later (carousels, product tiles) may import as static snapshots or need Commerce handling.
- **Header and footer:** These will stay as WKND unless you want the Lenovo navigation and footer migrated too. I'll ask about this after the homepage is imported.
- **Existing WKND pages:** Other WKND pages and the WKND import setup will be kept. Only the homepage content is replaced.

## Checklist
- [ ] **Step 1 – Turn on the Commerce add-on** (this step only), then wait for your next message before continuing
- [ ] **Step 2 – Find the site's pages:** get the Lenovo US English page list and suggest 3–4 representative extra pages
- [ ] **Step 3 – Confirm the page list** with you, marking each page as marketing or commerce (product listing or product detail)
- [ ] **Step 4 – Analyse the homepage:** capture screenshots, identify sections, pick blocks and variants, and check for reuse against the existing blocks
- [ ] **Step 5 – Map blocks:** record the homepage's block selectors and variants in the page template
- [ ] **Step 6 – Build homepage blocks:** create the new block variants needed (hero or carousel, promo cards, product tiles, and so on)
- [ ] **Step 7 – Build import tools:** create parsers and cleanup/section transformers for the homepage
- [ ] **Step 8 – Import the homepage** and save it as the main homepage, replacing the WKND one
- [ ] **Step 9 – Migrate homepage styling:** fonts, colours and spacing tokens, plus block styles
- [ ] **Step 10 – Check the homepage** in the preview against the original and fix major differences
- [ ] **Step 11 – Migrate the approved marketing pages**, reusing existing variants and adding new ones only where needed
- [ ] **Step 12 – Migrate the approved product listing and product detail pages** with the Commerce workflow
- [ ] **Step 13 – Check all imported pages** for complete content and correct styling
- [ ] **Step 14 – Code checks:** run the linter, fix any errors, and confirm the header, footer and remaining WKND pages still render
- [ ] **Step 15 – Ask you** whether to migrate the Lenovo header and footer as well
- [ ] **Step 16 – Summary:** list the migrated pages, new blocks and variants, and any known gaps. Saving and publishing your changes is done from the Console

## Execution Status
The plan is ready. Switch to Execute mode to start with Step 1, turning on the Commerce add-on.
