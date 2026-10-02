/* eslint-disable */
/* global WebImporter */

/**
 * Parser for faq-list block.
 * Source: https://wknd-adventures.com/index.html
 * Selector: .faq-list
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  let items = element.querySelectorAll('.faq-item');
  // Fallback: native <details> disclosure pattern
  if (items.length === 0) {
    items = element.querySelectorAll('details');
  }

  const cells = [];

  items.forEach((item) => {
    const question = item.querySelector('.faq-question, summary');
    const answer = item.querySelector('.faq-answer, .faq-item > div:last-child');
    cells.push([question || '', answer || '']);
  });

  // Guard: if no items found, leave the element unchanged
  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Faq List',
    cells,
  });
  element.replaceWith(block);
}
