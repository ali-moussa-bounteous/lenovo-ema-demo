/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-series. Base: cards.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (.x-cms-ofp-fe-2c-widgets-segmentespots)
 *   — 2 instances, each one block of 4 series cards.
 * Output (2 columns, one row per card):
 *   [ product cutout image | H3 headline, series label paragraph (.desctext), "Shop Now" link ]
 *
 * Iteration is keyed on the block-level article.segment-spot-card wrappers (fallback:
 * .swiper-slide), skipping swiper loop clones (.swiper-slide-duplicate) and duplicate hrefs.
 * The visible "Shop Now" is a <button> without href; the real target is the card's overlay
 * anchor a.segment-spot-card-action[href], whose label is taken from the button text.
 * Placeholder alt " " is cleared (decorative cutouts; the series label carries the name).
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll('article.segment-spot-card')];
  if (!cards.length) cards = [...element.querySelectorAll('.swiper-slide')];
  cards = cards.filter((c) => !c.closest('.swiper-slide-duplicate'));

  const cells = [];
  const seen = new Set();
  cards.forEach((card) => {
    const img = card.querySelector('.small-icon-item-head-image img') || card.querySelector('img');
    const headlineEl = card.querySelector('.headline h1, .headline h2, .headline h3, .headline h4, .headline');
    const headline = clean(headlineEl && headlineEl.textContent);
    const labels = [...card.querySelectorAll('.desctext p')].filter((p) => clean(p.textContent));
    const descText = card.querySelector('.desctext');
    const action = card.querySelector('a.segment-spot-card-action[href]')
      || card.querySelector('.small-icon-item-cta a[href]');
    const btn = card.querySelector('.small-icon-item-cta-btn, .small-icon-item-cta button');

    if (!headline && !img) return;
    const key = (action && action.getAttribute('href')) || headline;
    if (seen.has(key)) return;
    seen.add(key);

    const body = [];
    if (headline) {
      const h3 = document.createElement('h3');
      h3.textContent = headline;
      body.push(h3);
    }
    if (labels.length) {
      labels.forEach((p) => {
        const out = document.createElement('p');
        out.innerHTML = p.innerHTML.trim();
        body.push(out);
      });
    } else if (clean(descText && descText.textContent)) {
      const out = document.createElement('p');
      out.textContent = clean(descText.textContent);
      body.push(out);
    }
    if (action) {
      const a = document.createElement('a');
      a.href = action.getAttribute('href');
      a.textContent = clean(btn && btn.textContent) || clean(action.textContent) || 'Shop Now';
      const p = document.createElement('p');
      p.append(a);
      body.push(p);
    }

    if (img && !clean(img.getAttribute('alt'))) img.setAttribute('alt', '');
    cells.push([img || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-series', cells });
  element.replaceWith(block);
}
