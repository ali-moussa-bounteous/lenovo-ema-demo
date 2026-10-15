import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const PRICE = /[$€£¥]\s?\d/;

function optimize(img, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', false, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/** The element holding an image (its <p>, <picture> or the <img> itself). */
function imageHolder(img, root) {
  let el = img.closest('picture') || img;
  while (el.parentElement && el.parentElement !== root && !el.parentElement.textContent.trim()) {
    el = el.parentElement;
  }
  return el;
}

const isLinkOnly = (el) => {
  const links = el.querySelectorAll('a[href]');
  if (!links.length || el.querySelector('img')) return false;
  return el.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
};

/**
 * Splits a tile body into the part shown above the image (badge, product
 * name heading, short sub-label) and the part below it (price, specs, CTA).
 */
function splitHead(elements) {
  const hIndex = elements.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  if (hIndex < 0) return [[], elements];
  let end = hIndex + 1;
  while (end < elements.length) {
    const el = elements[end];
    const text = el.textContent.trim();
    const isLabel = el.tagName === 'P' && !el.querySelector('a, img') && text.length <= 40 && !PRICE.test(text);
    if (!isLabel) break;
    el.classList.add('cards-listing-label');
    end += 1;
  }
  // a short text before the heading is the badge (e.g. NEW ARRIVAL)
  elements.slice(0, hIndex).forEach((el) => {
    if (!el.querySelector('a, img') && el.textContent.trim().length <= 30) el.classList.add('cards-listing-badge');
  });
  return [elements.slice(0, end), elements.slice(end)];
}

/**
 * Cards (listing): bordered product tiles - optional badge, product-name
 * heading (link), optional sub-label, product image, price, spec bullets and
 * an outlined button pinned to the bottom.
 * One authored row per tile: image | badge, heading, sub-label, price, list, link.
 * A row without a heading (e.g. a promo tile) keeps its authored order.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    const li = document.createElement('li');
    li.className = 'cards-listing-item';

    const img = row.querySelector('img');
    let media = null;
    if (img) {
      media = document.createElement('div');
      media.className = 'cards-listing-image';
      media.append(optimize(img, [{ width: '400' }]));
      imageHolder(img, row).remove();
    }

    const elements = [];
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && (n.textContent.trim() || n.querySelector('img'))) {
          elements.push(n);
        } else if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = n.textContent.trim();
          elements.push(p);
        }
      });
    });
    elements.forEach((el) => {
      if (PRICE.test(el.textContent) && !el.querySelector('a') && el.tagName !== 'UL') el.classList.add('cards-listing-price');
      if (isLinkOnly(el) && !/^H[1-6]$/.test(el.tagName)) el.classList.add('cards-listing-actions');
    });

    const [headEls, restEls] = splitHead(elements);
    if (headEls.length) {
      const head = document.createElement('div');
      head.className = 'cards-listing-head';
      head.append(...headEls);
      li.append(head);
    } else {
      // promo tile: no product structure. Its image is a brand logo (kept at
      // its own size, not boxed like a product shot) and a leading bold-only
      // paragraph is its headline.
      li.classList.add('cards-listing-promo');
      if (media) media.className = 'cards-listing-promo-logo';
      const [lead] = restEls;
      if (lead && lead.tagName === 'P' && !lead.querySelector('a, img')
        && lead.querySelector('strong, b') && lead.textContent.trim() === lead.querySelector('strong, b').textContent.trim()) {
        lead.classList.add('cards-listing-promo-title');
      }
    }
    if (media) li.append(media);
    const body = document.createElement('div');
    body.className = 'cards-listing-body';
    body.append(...restEls);
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
