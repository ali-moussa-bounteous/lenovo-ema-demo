/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-listing. Base: cards.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (section.productCard_container.card-product-list)
 *   — 1 instance: 9 product tiles + 1 merchandising promo tile (static snapshot of the PLP grid).
 * Output (2 columns, one row per tile):
 *   product: [ product image | badge paragraph (merch flag, optional), H3 > link (product name -> PDP),
 *              sub-label paragraph (e.g. "Copilot+ PC", optional),
 *              price paragraph "Starting at [<del>original</del>] <strong>price</strong>",
 *              spec bullet list, "View N Models" link ]
 *   promo:   [ logo image | <strong> title paragraph, text paragraph, CTA link ]  (no heading, so the
 *              block keeps the promo's authored order)
 *
 * Iteration is keyed on the block-level li.product_item wrappers (li.product_interruptors-pc = promo).
 * Product: .merchandising_flag, .product_title a[href], .copilot-plus-badge_label,
 *   .normal_image img (img.image_focus; the hover image img.image_blur is skipped),
 *   .strike-through-price, .price-title, .features li, a.product_cta_button.
 * Product links are site-relative on the source (/us/en/p/...); there is no commerce backend on EDS,
 * so they are resolved against https://www.lenovo.com (same as the absolute links elsewhere on the page).
 * Live-catalog chrome (compare, ratings, wishlist, rewards, eCoupon, financing) is removed by
 * lenovo-laptops-cleanup.js and is never read here.
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function absolute(href) {
  if (!href) return '';
  try {
    return new URL(href, 'https://www.lenovo.com/').href;
  } catch (e) {
    return href;
  }
}

function keepSvg(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?icon`);
  return img;
}

function para(document, ...nodes) {
  const p = document.createElement('p');
  p.append(...nodes);
  return p;
}

function link(document, href, text) {
  const a = document.createElement('a');
  a.href = absolute(href);
  a.textContent = text;
  return a;
}

function buildProduct(item, document) {
  const titleLink = item.querySelector('.product_title a[href]');
  const titleEl = titleLink || item.querySelector('.product_title');
  const name = clean(titleEl && titleEl.textContent);
  const pdp = (titleLink && titleLink.getAttribute('href'))
    || item.getAttribute('data-dlp-url') || '';

  const img = item.querySelector('.normal_image img')
    || item.querySelector('.product_image_content img:not(.image_blur)');
  if (!name && !img) return null;

  const body = [];
  const badge = clean((item.querySelector('.merchandising_flag') || {}).textContent);
  if (badge) {
    const strong = document.createElement('strong');
    strong.textContent = badge;
    body.push(para(document, strong));
  }

  if (name) {
    const h3 = document.createElement('h3');
    if (pdp) h3.append(link(document, pdp, name));
    else h3.textContent = name;
    body.push(h3);
  }

  item.querySelectorAll('.copilot-plus-badge_label, .copilot-plus-badge_content').forEach((el) => {
    if (el.matches('.copilot-plus-badge_content') && el.querySelector('.copilot-plus-badge_label')) return;
    const text = clean(el.textContent);
    if (text) body.push(para(document, text));
  });

  const priceStack = item.querySelector('.price-stack');
  if (priceStack) {
    const startingAt = clean((priceStack.querySelector('.starting-at-container') || {}).textContent);
    const price = clean((priceStack.querySelector('.price-title') || {}).textContent);
    const strike = clean((priceStack.querySelector('.strike-through-price') || {}).textContent);
    if (price || strike) {
      const p = document.createElement('p');
      if (startingAt) p.append(`${startingAt} `);
      if (strike && strike !== price) {
        const del = document.createElement('del');
        del.textContent = strike;
        p.append(del, ' ');
      }
      if (price) {
        const strong = document.createElement('strong');
        strong.textContent = price;
        p.append(strong);
      }
      body.push(p);
    }
  }

  const specs = [...item.querySelectorAll('.features li')].map((li) => clean(li.textContent)).filter(Boolean);
  if (specs.length) {
    const ul = document.createElement('ul');
    specs.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      ul.append(li);
    });
    body.push(ul);
  }

  const cta = item.querySelector('a.product_cta_button[href], .cta_container a[href]');
  if (cta && clean(cta.textContent)) {
    body.push(para(document, link(document, cta.getAttribute('href'), clean(cta.textContent))));
  }

  if (img && !clean(img.getAttribute('alt')) && name) img.setAttribute('alt', name);
  return [img || '', body];
}

function buildPromo(item, document) {
  const logo = item.querySelector('.financingLogoImg img, img');
  const title = clean((item.querySelector('.financingContentHeader') || {}).textContent);
  const texts = [...item.querySelectorAll('.financingContent p')]
    .filter((p) => !p.closest('.financingContentHeader') && clean(p.textContent));
  const cta = item.querySelector('.interruptersButton a[href], a.cta-button[href]');
  if (!title && !texts.length) return null;

  const body = [];
  if (title) {
    const strong = document.createElement('strong');
    strong.textContent = title;
    body.push(para(document, strong));
  }
  texts.forEach((p) => {
    const out = document.createElement('p');
    out.innerHTML = p.innerHTML.trim();
    body.push(out);
  });
  if (cta && clean(cta.textContent)) {
    body.push(para(document, link(document, cta.getAttribute('href'), clean(cta.textContent))));
  }
  if (logo) keepSvg(logo);
  return [logo || '', body];
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('li.product_item')];

  const cells = [];
  const seen = new Set();
  items.forEach((item) => {
    const isPromo = item.matches('[class*="product_interruptors"]') || !!item.querySelector('.product_interruptors_card');
    const code = item.getAttribute('data-product-code');
    if (code) {
      if (seen.has(code)) return;
      seen.add(code);
    }
    const row = isPromo ? buildPromo(item, document) : buildProduct(item, document);
    if (row) cells.push(row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-listing', cells });
  element.replaceWith(block);
}
