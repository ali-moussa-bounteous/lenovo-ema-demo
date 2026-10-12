/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-promo variant.
 * Base: columns. Source: https://wknd-adventures.com/adventures.html
 * Selector: .grid-layout.grid-layout--2col
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cells = [];
  // Try .card children first, then fall back to direct children (gear list layout)
  let items = [...element.querySelectorAll('.card')];
  if (items.length === 0) {
    items = [...element.children];
  }

  if (items.length > 0) {
    const row = [];
    items.forEach((item) => {
      const col = document.createElement('div');

      const eyebrow = item.querySelector('.tag, .hero-eyebrow');
      if (eyebrow) {
        const p = document.createElement('p');
        p.innerHTML = `<em>${eyebrow.textContent.trim()}</em>`;
        col.appendChild(p);
      }

      const heading = item.querySelector('h2, h3, h4');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent.trim();
        col.appendChild(h3);
      }

      const desc = item.querySelector('.paragraph-lg, .paragraph-md, p[class*="paragraph"]');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        col.appendChild(p);
      }

      // Lists (e.g. gear lists)
      const list = item.querySelector('ul, ol');
      if (list) {
        col.appendChild(list.cloneNode(true));
      }

      const link = item.querySelector('a.button, a[class*="button"]');
      if (link) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        const label = link.querySelector('.button-label');
        a.textContent = label ? label.textContent.trim() : link.textContent.trim();
        p.appendChild(a);
        col.appendChild(p);
      }

      row.push(col);
    });
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-promo)',
    cells,
  });
  element.replaceWith(block);
}
