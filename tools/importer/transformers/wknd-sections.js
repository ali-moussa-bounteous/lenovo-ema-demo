/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND sections (generic).
 * Detects section boundaries and styles from CSS classes on the source page.
 * No template dependency — works on any page.
 *
 * Runs in beforeTransform: inserts <hr> section breaks and Section Metadata blocks.
 */

// Map source CSS classes to EDS section styles
const STYLE_MAP = {
  'inverse-section': 'dark',
  'secondary-section': 'secondary',
  'accent-section': 'accent',
  'hero-section': 'dark',
};

// Map child element classes to compound style modifiers
const COMPOUND_MAP = {
  'container--narrow': 'narrow',
  'utility-text-align-center': 'center',
  'text-center': 'center',
};

/**
 * Derive the EDS section style from a source <section> element's CSS classes.
 * Returns null if no style applies, or a string like "dark" or "secondary, narrow".
 */
function detectSectionStyle(sectionEl) {
  // Find base style from section's own classes using classList (not string includes)
  let style = null;
  for (const [cssClass, edsStyle] of Object.entries(STYLE_MAP)) {
    if (sectionEl.classList.contains(cssClass)) {
      style = edsStyle;
      break;
    }
  }

  // Check for compound modifiers from child elements
  const compounds = [];
  for (const [childClass, modifier] of Object.entries(COMPOUND_MAP)) {
    if (sectionEl.querySelector(`.${childClass}`)) {
      compounds.push(modifier);
    }
  }

  const unique = [...new Set(compounds)];
  if (style && unique.length > 0) {
    return `${style}, ${unique.join(', ')}`;
  }
  if (style) return style;
  if (unique.length > 0) return unique.join(', ');
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  const sections = element.querySelectorAll('section');
  if (sections.length === 0) return;

  // Process in reverse order to avoid DOM position shifts when inserting nodes
  for (let i = sections.length - 1; i >= 0; i--) {
    const sectionEl = sections[i];
    const style = detectSectionStyle(sectionEl);

    // Add Section Metadata block if section has a style
    if (style) {
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      sectionEl.after(metaBlock);
    }

    // Add <hr> before non-first sections
    if (i > 0) {
      const hr = document.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
