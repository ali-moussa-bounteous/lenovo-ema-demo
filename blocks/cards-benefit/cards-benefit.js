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

/**
 * Cards (benefit): a row of benefit items with no card chrome - outline icon,
 * heading and paragraph. One authored row per item: icon | heading + text
 * (or everything in one cell; the first image is the icon).
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    const li = document.createElement('li');
    li.className = 'cards-benefit-item';

    const img = row.querySelector('img');
    if (img) {
      const icon = document.createElement('div');
      icon.className = 'cards-benefit-icon';
      const isSvg = /\.svg(\?|$)/i.test(img.getAttribute('src') || '');
      icon.append(isSvg ? img.cloneNode(true) : optimize(img, [{ width: '160' }]));
      imageHolder(img, row).remove();
      li.append(icon);
    }

    const body = document.createElement('div');
    body.className = 'cards-benefit-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    [...body.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
    });
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
