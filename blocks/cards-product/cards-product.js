import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['accessories'];

const PRICE = /[$€£¥]\s?\d/;

/** Cell carries only an image (picture/img, maybe inside a <p>). */
function isImageCell(cell) {
  return !!cell.querySelector('picture, img') && cell.textContent.trim() === '';
}

/** Undo global decorateButtons treatment (bold link-only paragraphs become buttons). */
function unbutton(p) {
  p.classList.remove('button-wrapper');
  if (!p.classList.length) p.removeAttribute('class');
  p.querySelectorAll('a').forEach((a) => {
    a.classList.remove('button', 'accent', 'primary', 'secondary');
    if (!a.classList.length) a.removeAttribute('class');
  });
}

function buildItem(row) {
  const li = document.createElement('li');
  li.className = 'cards-product-item';

  const cells = [...row.children];
  const imageCell = cells.find(isImageCell);

  if (imageCell) {
    const img = imageCell.querySelector('img');
    const media = document.createElement('div');
    media.className = 'cards-product-image';
    const picture = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '300' }]);
    const newImg = picture.querySelector('img');
    newImg.width = 150;
    newImg.height = 150;
    media.append(picture);
    li.append(media);
  }

  const body = document.createElement('div');
  body.className = 'cards-product-body';
  cells.filter((c) => c !== imageCell).forEach((cell) => body.append(...cell.childNodes));
  [...body.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  const blocks = [...body.querySelectorAll(':scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6')];
  blocks.forEach(unbutton);

  // name = first element carrying a link (else first element); price = a later text-only element
  const nameEl = blocks.find((el) => el.querySelector('a[href]')) || blocks[0];
  if (nameEl) nameEl.classList.add('cards-product-name');
  const priceEl = blocks.filter((el) => el !== nameEl && !el.querySelector('a[href]'))
    .find((el) => /\d/.test(el.textContent)) || null;
  if (priceEl) priceEl.classList.add('cards-product-price');

  // make the whole tile clickable via the product-name link (keeps its accessible name)
  const link = nameEl?.querySelector('a[href]') || body.querySelector('a[href]');
  if (link) {
    link.classList.add('cards-product-link');
    li.classList.add('cards-product-linked');
  }

  li.append(body);
  return li;
}

/* ---- accessories option: white vertical tiles (label, name, image, price, Shop button) ---- */

function optimizeKeepSize(img, widths) {
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

const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

function isLinkOnly(el) {
  const links = el.querySelectorAll('a[href]');
  if (!links.length || el.querySelector('img')) return false;
  return el.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
}

/**
 * Accessory tile: one row per product, cell 1 = product image, cell 2 =
 * optional label (e.g. READY TO SHIP), product name, price (optional
 * strikethrough original and discount), Shop link. Rendered top to bottom:
 * label, name, image, price, full-width button.
 */
function buildAccessoryItem(row) {
  const li = document.createElement('li');
  li.className = 'cards-product-tile';

  const img = row.querySelector('img');
  let media = null;
  if (img) {
    media = document.createElement('div');
    media.className = 'cards-product-tile-image';
    media.append(optimizeKeepSize(img, [{ width: '400' }]));
    imageHolder(img, row).remove();
  }

  const elements = [];
  [...row.children].forEach((cell) => {
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === Node.ELEMENT_NODE && n.textContent.trim()) elements.push(n);
      else if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = n.textContent.trim();
        elements.push(p);
      }
    });
  });

  const actions = elements.filter((el) => !isHeading(el) && isLinkOnly(el));
  const prices = elements.filter((el) => !actions.includes(el) && PRICE.test(el.textContent));
  const discounts = elements.filter((el) => !actions.includes(el) && !prices.includes(el)
    && /\d+\s?%\s*off/i.test(el.textContent));
  const texts = elements.filter((el) => ![...actions, ...prices, ...discounts].includes(el));
  // name = first heading, else the last remaining text; texts before it are labels
  const name = texts.find(isHeading) || texts[texts.length - 1];
  const nameIndex = texts.indexOf(name);

  const head = document.createElement('div');
  head.className = 'cards-product-tile-head';
  texts.slice(0, nameIndex + 1).forEach((el) => {
    el.classList.add(el === name ? 'cards-product-tile-name' : 'cards-product-tile-label');
    head.append(el);
  });

  prices.forEach((el) => el.classList.add('cards-product-tile-price'));
  discounts.forEach((el) => el.classList.add('cards-product-tile-discount'));
  actions.forEach((el) => el.classList.add('cards-product-tile-actions'));
  const below = [...prices, ...discounts, ...texts.slice(nameIndex + 1), ...actions];
  const body = document.createElement('div');
  body.className = 'cards-product-tile-body';
  // keep authored order for everything below the image
  elements.filter((el) => below.includes(el)).forEach((el) => body.append(el));

  if (head.childNodes.length) li.append(head);
  if (media) li.append(media);
  if (body.childNodes.length) li.append(body);
  return li;
}

/**
 * Product tiles: one row per product, cell 1 = product image, cell 2 = linked
 * product name + price. Rendered as a single-column stack of compact tiles.
 * Option `accessories`: white vertical tiles in a row (see buildAccessoryItem);
 * the default rendering is unchanged when the option is absent.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const build = active.includes('accessories') ? buildAccessoryItem : buildItem;
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    ul.append(build(row));
  });
  block.replaceChildren(ul);
}
