/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Lenovo gaming template section breaks and Section Metadata.
 *
 * Gaming-specific counterpart of lenovo-sections.js (left untouched for the
 * homepage). Driven entirely by payload.template.sections from
 * page-templates.json ("gaming"); each section.selector is an array of
 * DOM-verified candidates, first match wins:
 *   section-1  main.main_content > div:has(.resources-hero-image)  style null (no break)
 *   section-2  main.main_content > div:has(.left-img-right-txt)    style "sidebar"
 *   section-3  main.main_content > div:has(.shop-links-ul)         style null
 *   section-4  .gaminghp_common_title_wrap                         style "title-band"
 *   section-5  section.carousel-espot                              style null
 * Sections 4 and 5 live outside main.main_content (body-level
 * div.container9999#75bf06...), so selectors are resolved against the whole
 * transform root, not against <main>.
 *
 * - beforeTransform: insert <hr> before every non-first section while all
 *   section elements still exist (parsers replace block elements between hooks;
 *   section-5's boundary is the carousel-cards block element itself). <hr> is
 *   not a <div>, so :nth-of-type selectors used by parsers are unaffected.
 *   Styled sections get a marker attribute on their <hr>.
 * - afterTransform: insert a Section Metadata block right after each marker
 *   <hr> (or after the section element if it still exists).
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = null; // invalid selector in this DOM engine: try next candidate
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    // Reverse order so unprocessed sections stay where querySelector finds them.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // selector did not match this page; never guess

      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
