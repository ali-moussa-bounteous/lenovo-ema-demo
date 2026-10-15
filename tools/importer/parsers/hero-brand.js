/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-brand. Base: hero.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (section.x-cms-ofp-fe-common-hero-v2) — 1 instance
 * Output (1 column):
 *   Row 1: background photo (article.heroBlock > picture > img.heroBgImage)
 *   Row 2: logo image (.heroLogo img) in its own paragraph,
 *          H1 "The brand for <em>business excellence</em>" (source H2 promoted; page has no H1),
 *          CTA paragraph with "View All Models" link (.heroCta a, real href kept)
 * The heading is rendered 3x (.desktopOnly/.mobileOnly/.tabletOnly); only .desktopOnly is used
 * (the cleanup transformer removes the other two; this parser does not depend on that).
 * Each heading span becomes text; the last span (red accent phrase) is wrapped in <em>
 * (html2md's reviewHeadings() strips <strong> from headings, so <em> is used for the accent).
 * The logo is an SVG: helix-importer convertIcons() would turn any img src ending ".svg" into an
 * ":icon:" token (no /icons in this repo), so "?icon" is appended to keep a real image
 * (same convention as cards-icon.js / tabs-casestudy.js).
 * Generated: 2026-10-15 (laptops template)
 */
// github-slugger (used by the EDS pipeline for heading ids)
function slug(text) {
  return (text || '').replace(/\s+/g, ' ').trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

export default function parse(element, { document }) {
  const bgImg = element.querySelector('img.heroBgImage')
    || element.querySelector('article picture img');

  const logoImg = element.querySelector('.heroLogo img');

  const titleWrap = element.querySelector('.heroTitle .desktopOnly')
    || element.querySelector('.heroTitle')
    || element;
  const srcHeading = titleWrap.querySelector('h1, h2, h3, h4, h5, h6');

  const ctas = [...element.querySelectorAll('.heroCta a[href]')];

  if (!bgImg && !srcHeading && !ctas.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImg) cells.push([bgImg]);

  const content = [];
  if (logoImg) {
    const src = logoImg.getAttribute('src') || '';
    if (/\.svg$/i.test(src)) logoImg.setAttribute('src', `${src}?icon`);
    const p = document.createElement('p');
    p.append(logoImg);
    content.push(p);
  }

  if (srcHeading) {
    const h1 = document.createElement('h1');
    const spans = [...srcHeading.querySelectorAll(':scope > span')].filter((s) => s.textContent.trim());
    if (spans.length > 1) {
      spans.forEach((span, i) => {
        const text = span.textContent.trim();
        if (i > 0) h1.append(document.createTextNode(' '));
        if (i === spans.length - 1) {
          const em = document.createElement('em');
          em.textContent = text;
          h1.append(em);
        } else {
          h1.append(document.createTextNode(text));
        }
      });
    } else {
      h1.textContent = srcHeading.textContent.replace(/\s+/g, ' ').trim();
    }
    content.push(h1);
  }

  const seen = new Set();
  ctas.forEach((a) => {
    let href = a.getAttribute('href');
    // In-page link (#c-laptops-thinkpad-listing) to a heading: EDS regenerates heading ids from
    // the heading text (github-slugger), so point at that id instead of the source CMS id.
    if (href.startsWith('#') && href.length > 1) {
      let target = null;
      try { target = document.getElementById(decodeURIComponent(href.slice(1))); } catch (e) { /* bad id */ }
      if (target && /^H[1-6]$/.test(target.tagName) && target.textContent.trim()) {
        href = `#${slug(target.textContent)}`;
      }
    }
    const text = a.textContent.replace(/\s+/g, ' ').trim();
    if (!text || seen.has(href)) return; // responsive duplicates
    seen.add(href);
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    p.append(link);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-brand', cells });
  element.replaceWith(block);
}
