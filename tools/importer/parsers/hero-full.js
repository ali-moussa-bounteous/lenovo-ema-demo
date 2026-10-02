/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero (full-bleed overlay).
 * Source: https://wknd-adventures.com/
 * Selector: section.hero-section
 */
export default function parse(element, { document }) {
  // Extract background image from .hero-bg
  const bgImage = element.querySelector('.hero-bg img');

  // Extract content from .hero-content-inner (or fallback to .hero-content)
  const inner = element.querySelector('.hero-content-inner') || element.querySelector('.hero-content');

  const cells = [];

  // Row 1: Background image
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content — eyebrow, heading, lead, CTAs
  const contentCell = [];

  // Eyebrow: p.tag (e.g., "WKND Adventures")
  const eyebrow = inner && (inner.querySelector('.tag') || inner.querySelector('.hero-eyebrow'));
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }

  // Heading
  const heading = element.querySelector('h1, h2, .h1-heading');
  if (heading) contentCell.push(heading);

  // Lead paragraph
  const lead = element.querySelector('.hero-lead, .paragraph-xl, .paragraph-lg');
  if (lead) contentCell.push(lead);

  // CTAs: check both .button-group pattern and already-split <p><strong><a> pattern
  const btnGroup = element.querySelector('.button-group');
  if (btnGroup) {
    const links = btnGroup.querySelectorAll('a');
    links.forEach((link, i) => {
      const label = link.querySelector('.button-label');
      if (label) link.textContent = label.textContent.trim();
      // Wrap: first = strong (primary), rest = em (secondary)
      const p = document.createElement('p');
      const wrapper = document.createElement(i === 0 ? 'strong' : 'em');
      wrapper.appendChild(link.cloneNode(true));
      p.appendChild(wrapper);
      contentCell.push(p);
    });
  } else {
    // Fallback: already-split buttons from cleanup transformer
    const splitButtons = element.querySelectorAll('p > strong > a, p > em > a');
    splitButtons.forEach((link) => {
      contentCell.push(link.closest('p'));
    });
  }

  if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero',
    cells,
  });
  element.replaceWith(block);
}
