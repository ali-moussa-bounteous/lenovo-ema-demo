/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-benefit. Base: cards.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/
 *   (.layouts_special_content_3columns:has(.iconcard-vertical-list__item)) — 1 instance, 4 items
 * Output (2 columns, one row per item): [ icon image | H3 + paragraph(s) (+ CTA link if authored) ]
 *
 * Iteration is keyed on the block-level div.iconcard-vertical-list__item wrappers.
 * Item: img (outline SVG icon, alt " ") + span > h3 > span(styled) + span > p > span(styled)
 *       + div.ctaButton_main (empty on this page; a link is kept if one is present).
 * Icons are SVGs: "?icon" is appended so helix-importer convertIcons() keeps a real image
 * (same convention as cards-icon.js); cards-benefit.js matches /\.svg(\?|$)/.
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function keepSvg(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?icon`);
  return img;
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.iconcard-vertical-list__item')];

  const cells = [];
  items.forEach((item) => {
    const icon = item.querySelector('img');
    const headingEl = item.querySelector('h1, h2, h3, h4, h5, h6');
    const paragraphs = [...item.querySelectorAll('p')].filter((p) => clean(p.textContent));
    const links = [...item.querySelectorAll('.ctaButton_main a[href]')].filter((a) => clean(a.textContent));

    if (!headingEl && !paragraphs.length) return;

    const body = [];
    if (headingEl) {
      const h3 = document.createElement('h3');
      h3.textContent = clean(headingEl.textContent);
      body.push(h3);
    }
    paragraphs.forEach((p) => {
      const out = document.createElement('p');
      out.innerHTML = p.innerHTML.trim();
      body.push(out);
    });
    links.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = clean(a.textContent);
      const p = document.createElement('p');
      p.append(link);
      body.push(p);
    });

    let iconCell = '';
    if (icon && icon.getAttribute('src')) {
      keepSvg(icon);
      if (!clean(icon.getAttribute('alt'))) icon.setAttribute('alt', '');
      iconCell = icon;
    }
    cells.push([iconCell, body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-benefit', cells });
  element.replaceWith(block);
}
