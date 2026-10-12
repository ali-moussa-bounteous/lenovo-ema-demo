/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile. Base: cards.
 * Source: https://www.lenovo.com/us/en/ (.card-grid.detail .card-grid__wrapper) — 3 instances
 *   (XF-wrapped cards in a display-rows grid, and plain cards in display-carousel grids).
 * Output: one row per tile -> [image | H3 title (linked to the tile href) + description paragraph]
 * Iterates the block-level .len-card-item wrappers (not the card anchors) so that html2md
 * inline merging of adjacent anchors cannot collapse items.
 * Generated: 2026-09-29
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.len-card-item')];
  if (!items.length) items = [...element.querySelectorAll('.len-card')];

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('.len-card__bg-image img, .len-card__asset img, picture img');
    const titleEl = item.querySelector('.len-card__content-title, h3, h2, h4');
    const textEl = item.querySelector('.len-card__content-text, .len-card__content-text-container p');
    const anchor = item.querySelector('a[href]');
    const href = anchor ? anchor.getAttribute('href') : '';

    const title = titleEl ? titleEl.textContent.trim() : '';
    const text = textEl ? textEl.textContent.trim() : '';
    if (!img && !title && !text) return;

    const body = [];
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      body.push(p);
    }
    if (!title && href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text || href;
      p.append(a);
      body.push(p);
    }

    cells.push([img || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
