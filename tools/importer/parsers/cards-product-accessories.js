/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product, accessories option (laptops template). Base: cards.
 * Kept separate from cards-product.js (gaming merchandising reel), which is unchanged.
 * Block name "Cards Product (accessories)" -> EDS classes "cards-product accessories".
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/
 *   (.SplitterProductCarousel:not(.layouts_special_content_2columns11 .SplitterProductCarousel))
 *   — 1 instance, 4 accessory tiles. Block context: migration-work/block-context/cards-product/.
 * Output (2 columns, one row per tile):
 *   [ product image | label paragraph ("READY TO SHIP"), H3 product name,
 *     price paragraph (<del>original</del> <strong>final</strong>), discount paragraph ("38% off"),
 *     Shop link (only when a real href exists) ]
 *
 * Iteration is keyed on the block-level div.product_card wrappers (deduplicated by product code,
 * so swiper clones never add rows).
 * Source per card: .merchandising_flag span (label), .product_title span[role=heading][id=CODE],
 *   .normal_image img (lazy: div.shine placeholder until in view; only a real <img> is used),
 *   .price_container .strike-through-price .price (original), .final_price > span (final),
 *   .price-save-mt (discount), .product_card_cta_warp .shop_btn (div[role=button], no href).
 * The Shop control is script-driven and there is no product URL for these accessories anywhere in
 * the DOM (no anchor, data-href or a[href$="/{code}"]). A link is only emitted when one is found;
 * otherwise it is omitted, never invented. Wishlist/ratings are removed by the cleanup transformer.
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function para(document, ...nodes) {
  const p = document.createElement('p');
  p.append(...nodes);
  return p;
}

function productCode(card) {
  const idEl = card.querySelector('.product_title [id], .product_name [id]');
  if (idEl && /^[a-z0-9]{6,}$/i.test(idEl.id)) return idEl.id;
  const m = (card.className || '').match(/product_card_([A-Z0-9]{6,})/i);
  return m ? m[1] : '';
}

function productHref(card, document) {
  const own = card.querySelector('a[href]:not([href^="#"]):not([href^="javascript"])');
  if (own) return own.getAttribute('href');
  const dataEl = [card, ...card.querySelectorAll('[data-href], [data-url], [data-link-url]')]
    .find((el) => el.getAttribute('data-href') || el.getAttribute('data-url') || el.getAttribute('data-link-url'));
  if (dataEl) {
    return dataEl.getAttribute('data-href') || dataEl.getAttribute('data-url') || dataEl.getAttribute('data-link-url');
  }
  const code = productCode(card).toLowerCase();
  if (!code) return '';
  const match = [...document.querySelectorAll('a[href]')].find((a) => {
    try {
      const u = new URL(a.getAttribute('href'), 'https://www.lenovo.com/');
      return u.pathname.replace(/\/$/, '').toLowerCase().endsWith(`/${code}`);
    } catch (e) {
      return false;
    }
  });
  return match ? match.getAttribute('href') : '';
}

function absolute(href) {
  try {
    return new URL(href, 'https://www.lenovo.com/').href;
  } catch (e) {
    return href;
  }
}

function buildRow(card, document) {
  const nameEl = card.querySelector('.product_title, .product_name');
  const name = clean(nameEl && nameEl.textContent);
  const img = card.querySelector('.normal_image img, .img_box img, .v3card_product_image img');
  if (!name && !img) return null;

  const body = [];
  const label = clean((card.querySelector('.merchandising_flag') || {}).textContent);
  if (label) body.push(para(document, label));

  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    body.push(h3);
  }

  const priceWrap = card.querySelector('.price_container');
  if (priceWrap) {
    const strikeEl = priceWrap.querySelector('.strike-through-price .price');
    const strike = clean(strikeEl && strikeEl.textContent);
    // The importer unwraps attribute-less <span>s before parsing, so the price is
    // read from .final_price itself, minus its discount badge.
    let finalPrice = '';
    const finalEl = priceWrap.querySelector('.final_price');
    if (finalEl) {
      const copy = finalEl.cloneNode(true);
      copy.querySelectorAll('.price-save-mt, .price-save-pc').forEach((s) => s.remove());
      finalPrice = clean(copy.textContent);
    }
    if (strike || finalPrice) {
      const p = document.createElement('p');
      if (strike && strike !== finalPrice) {
        const del = document.createElement('del');
        del.textContent = strike;
        p.append(del);
        if (finalPrice) p.append(' ');
      }
      if (finalPrice) {
        const strong = document.createElement('strong');
        strong.textContent = finalPrice;
        p.append(strong);
      }
      body.push(p);
    }
    const discount = clean((priceWrap.querySelector('.price-save-mt, .price-save-pc') || {}).textContent);
    if (discount) body.push(para(document, discount));
  }

  const href = productHref(card, document);
  if (href) {
    const btn = card.querySelector('.product_card_cta_warp .shop_btn, .product_card_cta_warp [role="button"]');
    const a = document.createElement('a');
    a.href = absolute(href);
    a.textContent = clean(btn && btn.textContent) || 'Shop';
    body.push(para(document, a));
  }

  if (img && !clean(img.getAttribute('alt')) && name) img.setAttribute('alt', name);
  return { key: productCode(card) || name, row: [img || '', body] };
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.product_card')]
    .filter((c) => !c.closest('.swiper-slide-duplicate'));

  const cells = [];
  const seen = new Set();
  cards.forEach((card) => {
    const item = buildRow(card, document);
    if (!item || seen.has(item.key)) return;
    seen.add(item.key);
    cells.push(item.row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards Product (accessories)', cells });
  element.replaceWith(block);
}
