/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.lenovo.com/us/en/ (.card-grid.categories)
 * Output: one row per category -> [image | linked label paragraph]
 * Iterates the block-level .len-card-item wrappers (not the card anchors) so that
 * html2md inline merging of adjacent anchors cannot collapse items.
 * Generated: 2026-09-29
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.len-card-item')];
  if (!items.length) items = [...element.querySelectorAll('.len-card')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('.len-card__asset img, img');
    const titleEl = item.querySelector('.len-card__content-title, [class*="title"]');
    const label = (titleEl ? titleEl.textContent : item.textContent).trim();
    const anchor = item.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    if (!img && !label) return;

    const p = document.createElement('p');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      p.append(a);
    } else {
      p.textContent = label;
    }
    cells.push([img || '', p]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
