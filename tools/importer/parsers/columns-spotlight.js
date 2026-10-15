/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-spotlight. Base: columns.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (.layouts_special_content_2columns11) — 1 instance
 * Output: 1 row, 2 cells
 *   cell 1 (product panel, .layouts_special_2columns11_left .product_card):
 *     H3 product name, product image, "Starting at" paragraph, price paragraph (<strong>;
 *     strike-through original as <del> when present), "Shop" link
 *   cell 2 (photo panel, .layouts_special_2columns11_right .mediumContainer):
 *     background photo (img.background-image-container), H3, description paragraph(s),
 *     "Learn More" link (first CTA only; the responsive duplicate is ignored), logo if it has a src
 *
 * The product card's "Shop" control is a script-driven div[role=button] without an href. The
 * product code (span[id] / product_card_{CODE}_...) is used to look for a real anchor to the same
 * product elsewhere in the DOM (a[href$="/{code}"], e.g. the Featured ThinkPads "Shop Now" link);
 * if none exists the Shop link is omitted, never invented.
 * The product image is lazy-loaded (div.shine placeholder until in view); only a real <img> is used.
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
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
  const dataHref = card.getAttribute('data-href') || card.getAttribute('data-url')
    || (card.querySelector('[data-href], [data-url]') || { getAttribute: () => '' }).getAttribute('data-href');
  if (dataHref) return dataHref;
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

function para(document, ...nodes) {
  const p = document.createElement('p');
  p.append(...nodes);
  return p;
}

function buildProductCell(card, document) {
  const content = [];
  const nameEl = card.querySelector('.product_title, .product_name');
  const name = clean(nameEl && nameEl.textContent);
  if (name) {
    const h3 = document.createElement('h3');
    h3.textContent = name;
    content.push(h3);
  }

  const img = card.querySelector('.normal_image img, .img_box img, .v3card_product_image img');
  if (img) {
    if (!clean(img.getAttribute('alt')) && name) img.setAttribute('alt', name);
    content.push(para(document, img));
  }

  const priceWrap = card.querySelector('.price_container');
  if (priceWrap) {
    const startingAt = priceWrap.querySelector('.starting-at-container');
    if (clean(startingAt && startingAt.textContent)) {
      content.push(para(document, clean(startingAt.textContent)));
    }
    const finalEl = priceWrap.querySelector('.final_price span:not(.price-save-mt), .final_price');
    const finalPrice = clean(finalEl && finalEl.textContent);
    const strikeEl = priceWrap.querySelector('del, s, .strike-through, [class*="strike"], [class*="original_price"]');
    const strike = clean(strikeEl && strikeEl.textContent);
    if (finalPrice || strike) {
      const p = document.createElement('p');
      if (strike && strike !== finalPrice) {
        const del = document.createElement('del');
        del.textContent = strike;
        p.append(del, ' ');
      }
      if (finalPrice) {
        const strong = document.createElement('strong');
        strong.textContent = finalPrice;
        p.append(strong);
      }
      content.push(p);
    }
  }

  const shopBtn = card.querySelector('.product_card_cta_warp .shop_btn, .product_card_cta_warp [role="button"], .product_card_cta_warp a');
  const shopText = clean(shopBtn && shopBtn.textContent) || 'Shop';
  const href = productHref(card, document);
  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = shopText;
    content.push(para(document, a));
  }
  return content;
}

function buildPhotoCell(panel, document) {
  const content = [];
  const bg = panel.querySelector('img.background-image-container')
    || panel.querySelector('.medium_content_container > img');
  if (bg) content.push(para(document, bg));

  const titleEl = panel.querySelector('.medium_content_container_text_title');
  const title = clean(titleEl && titleEl.textContent);
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    content.push(h3);
  }

  panel.querySelectorAll('.medium_content_container_text_desc p').forEach((p) => {
    if (!clean(p.textContent)) return;
    const out = document.createElement('p');
    out.innerHTML = p.innerHTML.replace(/(<br\s*\/?>\s*)+$/i, '').trim();
    content.push(out);
  });

  const cta = panel.querySelector('.medium_content_container_text-cta-btn a[href]')
    || panel.querySelector('.medium_content_container_text-cta a[href]');
  if (cta) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = clean(cta.textContent);
    content.push(para(document, a));
  }

  const logo = [...panel.querySelectorAll('img.medium_content_container_text_logo')]
    .find((i) => i.getAttribute('src'));
  if (logo) content.push(para(document, logo));
  return content;
}

export default function parse(element, { document }) {
  const left = element.querySelector('.layouts_special_2columns11_left') || element.children[0];
  const right = element.querySelector('.layouts_special_2columns11_right') || element.children[1];

  const card = left && left.querySelector('.product_card');
  const panel = right && (right.querySelector('.mediumContainer') || right);

  const productCell = card ? buildProductCell(card, document) : [];
  const photoCell = panel ? buildPhotoCell(panel, document) : [];

  if (!productCell.length && !photoCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[productCell.length ? productCell : '', photoCell.length ? photoCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-spotlight', cells });
  element.replaceWith(block);
}
