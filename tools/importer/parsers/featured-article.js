/* eslint-disable */
/* global WebImporter */

/**
 * Parser for featured-article block.
 * Source: https://wknd-adventures.com/index.html
 * Selector: .featured-article
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  // Col 1: Featured article image (found in captured DOM: a.featured-article-image > img)
  const image = element.querySelector('.featured-article-image img, :scope > a img');

  // Col 2: Content elements
  const tag = element.querySelector('.tag');
  const heading = element.querySelector('h2, h3, .h2-heading, .h3-heading');
  // Broader description match — fall back to smaller paragraph classes if .paragraph-lg is absent
  const description = element.querySelector('.paragraph-lg, .paragraph-md, .paragraph-sm');

  const contentCol = [];
  if (tag) contentCol.push(tag);
  if (heading) contentCol.push(heading);
  if (description) contentCol.push(description);

  // CTA button
  const ctaLink = element.querySelector('.featured-article-footer > a, .featured-article-footer .button, a.button');
  if (ctaLink) {
    const label = ctaLink.querySelector('.button-label');
    if (label) ctaLink.textContent = label.textContent.trim();
    contentCol.push(ctaLink);
  }

  // Single row with 2 columns: image | content
  const cells = [
    [image || '', contentCol],
  ];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Featured Article',
    cells,
  });
  element.replaceWith(block);
}
