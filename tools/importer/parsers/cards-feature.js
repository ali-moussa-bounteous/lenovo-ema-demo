/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature variant.
 * Base: cards. Source: https://wknd-adventures.com/about.html
 * Selector: .grid-layout.desktop-3-column.grid-gap-lg:has(.card)
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cells = [];

  const cards = element.querySelectorAll('.card');
  cards.forEach((card) => {
    const row = document.createElement('div');

    // Heading
    const heading = card.querySelector('h2, h3, h4');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent.trim();
      row.appendChild(h3);
    }

    // Description paragraph
    const desc = card.querySelector('p');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      row.appendChild(p);
    }

    // Optional link
    const link = card.querySelector('a');
    if (link) {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      row.appendChild(a);
    }

    cells.push([row]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-feature)',
    cells,
  });
  element.replaceWith(block);
}
