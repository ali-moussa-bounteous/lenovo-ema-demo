/* eslint-disable */
/* global WebImporter */

/**
 * Parser for ticker variant (custom block).
 * Source: https://wknd-adventures.com/index.html
 * Selector: .ticker-strip
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  // Extract unique ticker items from .ticker-track
  // Live DOM has text nodes between <span class="ticker-sep">·</span> separators
  // Use textContent split approach for robustness regardless of DOM structure
  const track = element.querySelector('.ticker-track');
  const seen = new Set();
  const items = [];

  if (track) {
    const allText = track.textContent;
    const parts = allText.split('·').map((s) => s.trim()).filter(Boolean);
    parts.forEach((text) => {
      if (!seen.has(text)) {
        seen.add(text);
        items.push(text);
      }
    });
  }

  // Build a single container div with all items as paragraphs
  // Using a single wrapper element avoids array-spread issues in createBlock serialization
  const wrapper = document.createElement('div');
  items.forEach((item) => {
    const p = document.createElement('p');
    p.textContent = item;
    wrapper.appendChild(p);
  });

  const cells = [[wrapper]];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'ticker',
    cells,
  });
  element.replaceWith(block);
}
