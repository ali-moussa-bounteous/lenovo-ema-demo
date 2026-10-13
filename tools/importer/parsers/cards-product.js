/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards.
 * Source: https://www.lenovo.com/us/en/gaming/ (.widgets_merchandising_reel_pc_container .product)
 * — 5 matches inside the sidebar "Recommended Gaming Products" reel; together they form ONE
 * cards-product block (one row per product).
 * Output (2 columns): [product image | paragraph with linked product name + price paragraph (<strong>)]
 *
 * Source shapes handled:
 *  - Live DOM: a.swiper-slide[role=listitem] > div.product[data-*] > (.img_container > a > div.img
 *    with inline background-image) + (.text_container > a > div.name, .price, a.more).
 *    The outer slide anchor wraps further anchors (invalid nesting).
 *  - Re-parsed DOM (cleaned.html / html2md path): the nesting is flattened, so each div.product
 *    is a sibling of empty a.swiper-slide anchors and the image is an <img>.
 * Iteration is keyed on the block-level div.product wrappers (expected 5), never on the anchors.
 * Every part is read from inside its own div.product (it survives the flattening as a per-item
 * wrapper), with the product's data-* attributes (data-summary, data-link-url, data-price,
 * data-img-url) as fallbacks. Only one name link is emitted per product; the duplicate
 * a.swiper-slide anchors and the "Learn More" link (removed by the cleanup transformer) are ignored.
 * Prices come from a personalized feed and are kept as captured.
 * Generated: 2026-10-12
 */
const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/i;

function absolute(url) {
  if (!url) return '';
  try {
    return new URL(url, 'https://www.lenovo.com/').href;
  } catch (e) {
    return url;
  }
}

function decode(val) {
  if (!val) return '';
  try {
    return decodeURIComponent(val).trim();
  } catch (e) {
    return val.trim();
  }
}

function collectGroup(element) {
  const reel = element.closest('.widgets_merchandising_reel_pc_container');
  if (!reel) return [element];
  const group = [...reel.querySelectorAll('.product')];
  return group.length ? group : [element];
}

function buildRow(product, document) {
  const nameEl = product.querySelector('.text_container .name, .name');
  const name = (nameEl && nameEl.textContent.trim()) || decode(product.getAttribute('data-summary'));

  const nameLink = (nameEl && nameEl.closest('a[href]'))
    || product.querySelector('.text_container a[href]:not(.more)');
  const href = (nameLink && nameLink.getAttribute('href')) || product.getAttribute('data-link-url') || '';

  const priceEl = product.querySelector('.price_container .price, .price');
  const price = (priceEl && priceEl.textContent.trim()) || (product.getAttribute('data-price') || '').trim();

  // Image: real <img> (re-parsed DOM), then div.img background-image (live DOM), then data-img-url
  let img = product.querySelector('.img_container img, img');
  if (!img) {
    const bgEl = product.querySelector('.img_container .img, .img');
    const m = bgEl ? (bgEl.getAttribute('style') || '').match(URL_RE) : null;
    const src = absolute((m && m[1]) || product.getAttribute('data-img-url'));
    if (src) {
      img = document.createElement('img');
      img.src = src;
    }
  }
  if (img && !img.getAttribute('alt') && name) img.setAttribute('alt', name);

  if (!name && !img) return null;

  const body = [];
  if (name) {
    const p = document.createElement('p');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = name;
      p.append(a);
    } else {
      p.textContent = name;
    }
    body.push(p);
  }
  if (price) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = price;
    p.append(strong);
    body.push(p);
  }

  return { key: href || name, row: [img || '', body] };
}

export default function parse(element, { document }) {
  const products = collectGroup(element);

  const cells = [];
  const seen = new Set();
  products.forEach((product) => {
    const item = buildRow(product, document);
    if (!item || seen.has(item.key)) return; // skip swiper clones / duplicates
    seen.add(item.key);
    cells.push(item.row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Remove every other product (they are rows of this block now) and the empty slide anchors.
  products.forEach((product) => {
    if (product === element) return;
    const slide = product.parentElement && product.parentElement.matches('a.swiper-slide')
      && product.parentElement.children.length === 1 ? product.parentElement : null;
    // Detach the product itself (parentNode -> null) so the import script skips it.
    product.remove();
    if (slide) slide.remove();
  });

  // Live page: the product sits inside an a.swiper-slide anchor. A block table must not end up
  // inside a link, so the product is lifted out and the anchor dropped. In the re-parsed
  // (html2md) DOM the product is a direct child of the slide list and is replaced in place.
  const slideAnchor = element.parentElement && element.parentElement.closest('a');
  if (slideAnchor && slideAnchor.parentElement) {
    slideAnchor.before(element);
    slideAnchor.remove();
  }
  const list = element.parentElement;
  if (list) {
    list.querySelectorAll(':scope > a.swiper-slide').forEach((a) => {
      if (!a.textContent.trim() && !a.querySelector('img')) a.remove();
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
