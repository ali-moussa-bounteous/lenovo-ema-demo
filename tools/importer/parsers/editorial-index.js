/* eslint-disable */
/* global WebImporter */

/**
 * Parser for editorial-index block.
 * Source: https://wknd-adventures.com/index.html
 * Selector: .editorial-index
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  // Editorial items from .editorial-index (found in captured DOM)
  const items = element.querySelectorAll('.editorial-index-item');

  const cells = [];

  items.forEach((item) => {
    // Col 1: Large number (01, 02, 03)
    const number = item.querySelector('.editorial-index-number');
    // Col 2: Content div with heading + paragraph
    const content = item.querySelector(':scope > div');

    cells.push([number || '', content || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Editorial Index',
    cells,
  });
  element.replaceWith(block);
}
