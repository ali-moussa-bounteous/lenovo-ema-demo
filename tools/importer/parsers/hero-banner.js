/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.lenovo.com/us/en/gaming/ (.resources-hero-image) — 1 instance
 * Output (1 column):
 *   Row 1: banner image (div.resources-hero-image > img)
 *   Row 2: H1 heading + intro paragraph(s) (.resource-herowht-txt)
 * The gaming cleanup transformer renames the heading h2 -> h1 before parsers run,
 * so the heading is selected by position (any heading) rather than by tag.
 * Generated: 2026-10-12
 */
const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/i;

function read(val) {
  const m = (val || '').match(URL_RE);
  return m ? m[1] : '';
}

// The page defines the banner in an inline <style>:
//   .resources-hero-image{ background:url('//p1-ofp.static.pub/.../gaming-main-banner-seg-hero-banner.jpg') ... }
function styleSheetUrl(el, document) {
  const classes = [...el.classList];
  if (!classes.length) return '';
  for (const style of document.querySelectorAll('style')) {
    const css = style.textContent || '';
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = ruleRe.exec(css))) {
      const selectors = m[1].split(',').map((s) => s.trim());
      const hit = selectors.some((s) => classes.some((c) => new RegExp(`\\.${c}$`).test(s)));
      if (hit && /background(-image)?\s*:/i.test(m[2])) {
        const src = read(m[2]);
        if (src) return src;
      }
    }
  }
  return '';
}

function backgroundUrl(el, document) {
  let src = read(el.getAttribute('style'));
  if (!src) src = styleSheetUrl(el, document);
  if (!src && typeof window !== 'undefined' && window.getComputedStyle) {
    try { src = read(window.getComputedStyle(el).backgroundImage); } catch (e) { /* detached */ }
  }
  if (!src) return '';
  try { return new URL(src, 'https://www.lenovo.com/').href; } catch (e) { return src; }
}

export default function parse(element, { document }) {
  const textWrap = element.querySelector('.resource-herowht-txt') || element;

  // Banner image: direct child img first, then any image outside the text wrapper
  let img = element.querySelector(':scope > img, :scope > picture img');
  if (!img) {
    img = [...element.querySelectorAll('img')].find((i) => textWrap === element || !textWrap.contains(i)) || null;
  }

  // Live page: the banner is a CSS background-image on .resources-hero-image
  // (the scraped cleaned.html already materialised it as an <img>).
  if (!img) {
    const src = backgroundUrl(element, document);
    if (src) {
      img = document.createElement('img');
      img.src = src;
      img.alt = '';
    }
  }

  const headingEl = textWrap.querySelector('h1, h2, h3, h4, h5, h6');
  const paragraphs = [...textWrap.querySelectorAll('p')].filter((p) => p.textContent.trim());

  if (!img && !headingEl && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (img) cells.push([img]);

  const content = [];
  if (headingEl) {
    const h1 = document.createElement('h1');
    h1.textContent = headingEl.textContent.trim();
    content.push(h1);
  }
  content.push(...paragraphs);
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
