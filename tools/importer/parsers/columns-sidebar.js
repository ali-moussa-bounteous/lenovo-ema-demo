/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-sidebar variant.
 * Base: columns. Source: https://wknd-adventures.com/blog/patagonia-trek.html
 * Selector: .secondary-section .grid-layout.desktop-3-column.grid-align-center
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect columns by content (not position)
  let gearChild = null;
  let quoteChild = null;
  [...element.children].forEach((child) => {
    if (child.querySelector('.pull-quote, blockquote')) {
      quoteChild = child;
    } else if (child.querySelector('ul, ol')) {
      gearChild = child;
    }
  });

  // Column 1: heading + gear list
  const col1 = document.createElement('div');
  if (gearChild) {
    const heading = gearChild.querySelector('h2, h3, h4');
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      col1.appendChild(h);
    }
    const list = gearChild.querySelector('ul, ol');
    if (list) {
      col1.appendChild(list.cloneNode(true));
    }
  }

  // Column 2: pull quote with attribution
  const col2 = document.createElement('div');
  if (quoteChild) {
    const pullQuote = quoteChild.querySelector('.pull-quote') || quoteChild.querySelector('blockquote');
    if (pullQuote) {
      const blockquote = document.createElement('blockquote');
      const quoteBody = pullQuote.querySelector('.pull-quote-body');
      if (quoteBody) {
        blockquote.textContent = quoteBody.textContent.trim();
      } else {
        blockquote.textContent = pullQuote.textContent.trim();
      }
      col2.appendChild(blockquote);
      const attribution = pullQuote.querySelector('.pull-quote-attribution');
      if (attribution) {
        const cite = document.createElement('p');
        cite.innerHTML = `<em>${attribution.textContent.trim()}</em>`;
        col2.appendChild(cite);
      }
    }
  }

  cells.push([col1, col2]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-pullquote)',
    cells,
  });
  element.replaceWith(block);
}
