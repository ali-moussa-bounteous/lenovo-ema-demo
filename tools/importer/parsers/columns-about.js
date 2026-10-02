/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-about variant.
 * Base: columns. Source: https://wknd-adventures.com/about.html
 * Selector: .grid-layout.grid-gap-xl.tablet-1-column
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect text column vs image column by content (not position)
  let textChild = null;
  let imgChild = null;
  [...element.children].forEach((child) => {
    if (child.tagName === 'IMG' || child.querySelector('img')) {
      imgChild = child;
    } else {
      textChild = child;
    }
  });

  // Column 1: text content (heading + paragraphs)
  const col1 = document.createElement('div');
  if (textChild) {
    const heading = textChild.querySelector('h2, h3, h4');
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      col1.appendChild(h);
    }
    const paragraphs = textChild.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const newP = document.createElement('p');
      newP.textContent = p.textContent.trim();
      col1.appendChild(newP);
    });
  }

  // Column 2: image (may be a bare <img> or a <div> wrapping an <img>)
  const col2 = document.createElement('div');
  if (imgChild) {
    const img = imgChild.tagName === 'IMG'
      ? imgChild
      : imgChild.querySelector('img');
    if (img) {
      col2.appendChild(img.cloneNode(true));
    }
  }

  cells.push([col1, col2]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Columns (columns-about)',
    cells,
  });
  element.replaceWith(block);
}
