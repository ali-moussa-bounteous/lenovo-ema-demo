/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Lenovo section breaks and section metadata.
 * Driven entirely by payload.template.sections (page-templates.json); each
 * section.selector is an array of DOM-verified candidates, first match wins.
 *
 * - beforeTransform: insert <hr> before every non-first section while all
 *   section elements still exist (parsers replace block elements between hooks).
 *   <hr> is not a <div>, so :nth-of-type selectors used by parsers are unaffected.
 * - afterTransform: insert a Section Metadata block after the marker <hr> for
 *   sections whose style is non-null (none currently on the home template).
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
      el = null;
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
