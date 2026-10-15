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

/** The element holding an image (its <p>, <picture> or the <img> itself). */
function imageHolder(img, root) {
  let el = img.closest('picture') || img;
  while (el.parentElement && el.parentElement !== root && !el.parentElement.textContent.trim()) {
    el = el.parentElement;
  }
  return el;
}

/** Paragraph(s) holding only links: the card's call to action. */
function markActions(body) {
  [...body.children].forEach((el) => {
    const links = el.querySelectorAll('a[href]');
    if (!links.length || el.querySelector('img') || /^H[1-6]$/.test(el.tagName)) return;
    const text = [...links].map((a) => a.textContent.trim()).join('');
    if (el.textContent.trim() === text) el.classList.add('cards-featured-actions');
  });
}

/** Height / width of an authored image, or 0 when it carries no dimensions. */
function ratio(img) {
  const w = parseInt(img && img.getAttribute('width'), 10);
  const h = parseInt(img && img.getAttribute('height'), 10);
  return w > 0 && h > 0 ? h / w : 0;
}

/**
 * Cards (featured): rounded promo cards - photo on top, heading, paragraph or
 * bullet list and a button pinned to the card bottom. When the first card's
 * photo is markedly taller than the next card's (a portrait spotlight image),
 * that card becomes a spotlight: its text is layered over its photo. Cards
 * with equal photos all render alike. Four cards (or a multiple of four)
 * lay out 4-up on wide screens, otherwise 3-up.
 * One authored row per card: photo | heading + text/list + link.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  const ratios = [];
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    const li = document.createElement('li');
    li.className = 'cards-featured-item';

    const img = row.querySelector('img');
    ratios.push(ratio(img));
    if (img) {
      const media = document.createElement('div');
      media.className = 'cards-featured-image';
      media.append(optimize(img, [{ media: '(width >= 600px)', width: '750' }, { width: '600' }]));
      imageHolder(img, row).remove();
      li.append(media);
    }

    const body = document.createElement('div');
    body.className = 'cards-featured-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    [...body.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
    });
    markActions(body);
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  // first card: text over photo, only when it has both and its photo is a
  // distinctly taller (portrait) spotlight image than the following card's
  const first = ul.firstElementChild;
  const [firstRatio, nextRatio] = ratios;
  if (first && ul.children.length > 1 && firstRatio && nextRatio && firstRatio >= nextRatio * 1.5
    && first.querySelector('.cards-featured-image') && first.querySelector('.cards-featured-body')) {
    first.classList.add('cards-featured-overlay');
  }
  ul.dataset.count = String(ul.children.length);

  block.replaceChildren(ul);
}
