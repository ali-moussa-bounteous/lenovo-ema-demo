import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function optimize(img, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', false, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

function trimWhitespace(el) {
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
}

/** The element holding an image (its <p>, <picture> or the <img> itself). */
function imageHolder(img, cell) {
  let el = img.closest('picture') || img;
  while (el.parentElement && el.parentElement !== cell && !el.parentElement.textContent.trim()) {
    el = el.parentElement;
  }
  return el;
}

/** Marks the paragraph(s) holding only links so CSS can pin them to the panel end. */
function markActions(container) {
  [...container.children].forEach((el) => {
    const links = el.querySelectorAll('a[href]');
    if (!links.length || el.querySelector('img') || /^H[1-6]$/.test(el.tagName)) return;
    const text = [...links].map((a) => a.textContent.trim()).join('');
    if (el.textContent.trim() === text) el.classList.add('columns-spotlight-actions');
  });
}

/**
 * Photo panel: the cell starts with an image and also carries text. The first
 * image becomes the panel background; the text is layered over it.
 */
function decoratePhotoPanel(cell, bgImg) {
  const holder = imageHolder(bgImg, cell);
  const media = document.createElement('div');
  media.className = 'columns-spotlight-media';
  media.append(optimize(bgImg, [{ media: '(width >= 900px)', width: '1600' }, { width: '900' }]));
  holder.remove();

  const content = document.createElement('div');
  content.className = 'columns-spotlight-content';
  content.append(...cell.childNodes);
  trimWhitespace(content);
  // further images (e.g. a brand logo) sit on the panel itself, not in the text column
  const logos = [...content.querySelectorAll('img')].map((img) => {
    const pic = optimize(img, [{ width: '600' }]);
    const link = img.closest('a');
    imageHolder(img, content).remove();
    const wrap = document.createElement('div');
    wrap.className = 'columns-spotlight-logo';
    if (link) {
      const a = link.cloneNode(false);
      a.append(pic);
      wrap.append(a);
    } else wrap.append(pic);
    return wrap;
  });
  markActions(content);
  cell.replaceChildren(media, content, ...logos);
  cell.classList.add('columns-spotlight-photo');
}

/** Product panel: heading, product image, price text, button stacked. */
function decorateProductPanel(cell) {
  trimWhitespace(cell);
  cell.querySelectorAll('img').forEach((img) => {
    const pic = optimize(img, [{ width: '600' }]);
    const h = imageHolder(img, cell);
    const wrap = document.createElement('div');
    wrap.className = 'columns-spotlight-image';
    wrap.append(pic);
    h.replaceWith(wrap);
  });
  markActions(cell);
  cell.classList.add('columns-spotlight-product');
}

/**
 * Columns (spotlight): two heterogeneous panels side by side (~30/70) - a
 * product panel (name, image, price, button) and a photo panel (background
 * photo with heading, text, button and optional logo). Any cell that starts
 * with an image and also carries text is treated as a photo panel.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  [...block.children].forEach((row) => {
    row.classList.add('columns-spotlight-row');
    const cells = [...row.children].filter((cell) => cell.textContent.trim() || cell.querySelector('img'));
    [...row.children].filter((cell) => !cells.includes(cell)).forEach((cell) => cell.remove());
    row.dataset.cols = String(cells.length);
    cells.forEach((cell) => {
      cell.classList.add('columns-spotlight-panel');
      const first = [...cell.children].find((el) => el.textContent.trim() || el.querySelector('img'));
      const firstImg = first && (first.tagName === 'IMG' ? first : first.querySelector('img'));
      const startsWithImage = firstImg && !first.textContent.trim();
      if (startsWithImage && cell.textContent.trim()) decoratePhotoPanel(cell, firstImg);
      else decorateProductPanel(cell);
    });
  });
}
