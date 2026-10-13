import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

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

/**
 * Product tiles: one row per product, cell 1 = product image, cell 2 = linked
 * product name + price. Rendered as a single-column stack of compact tiles.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return;
    ul.append(buildItem(row));
  });
  block.replaceChildren(ul);
}
