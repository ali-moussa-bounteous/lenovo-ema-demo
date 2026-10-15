/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-reveal. Base: cards.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/
 *   (.layouts_special_content_wishlist:has(section.student-espot)) — 1 instance, 5 tiles
 * Output (2 columns, one row per tile):
 *   [ photo (img.student-espot__image) | icon image, H3 title, description paragraph ]
 *
 * Iteration is keyed on the block-level section.student-espot wrappers (one per tile).
 * The source headline is an H2; it becomes H3 (tiles sit under the "Discover ThinkPad" H2).
 * Icons are SVGs: helix-importer convertIcons() would turn a src ending ".svg" into an
 * ":icon:" token (no /icons in this repo), so "?icon" is appended to keep a real image
 * (same convention as cards-icon.js). Placeholder alt " " on icons is cleared.
 * The reveal button, scrim and divider are presentational and dropped.
 * Generated: 2026-10-15 (laptops template)
 */
function keepSvg(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?icon`);
  return img;
}

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('section.student-espot')];
  if (!tiles.length) tiles = [...element.querySelectorAll('[class*="espot_inner_container"]')];

  const cells = [];
  tiles.forEach((tile) => {
    const photo = tile.querySelector('img.student-espot__image')
      || tile.querySelector('.student-espot__media img');
    const icon = tile.querySelector('img.student-espot__icon')
      || tile.querySelector('.student-espot__icon-wrap img');
    const headline = tile.querySelector('.student-espot__headline, h1, h2, h3, h4');
    const descs = [...tile.querySelectorAll('.student-espot__description')]
      .filter((d) => clean(d.textContent));

    if (!photo && !headline) return;

    const body = [];
    if (icon) {
      keepSvg(icon);
      if (!clean(icon.getAttribute('alt'))) icon.setAttribute('alt', '');
      const p = document.createElement('p');
      p.append(icon);
      body.push(p);
    }
    if (headline) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(headline.textContent);
      body.push(h3);
    }
    descs.forEach((d) => {
      const p = document.createElement('p');
      p.innerHTML = d.innerHTML.trim();
      body.push(p);
    });

    cells.push([photo || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-reveal', cells });
  element.replaceWith(block);
}
