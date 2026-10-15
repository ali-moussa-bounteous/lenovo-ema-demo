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
 * Cards (series): category navigation cards - product cutout image, heading,
 * series label and a button pinned to the card bottom.
 * One authored row per card: image | heading + label + link.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    const li = document.createElement('li');
    li.className = 'cards-series-item';

    const img = row.querySelector('img');
    if (img) {
      const media = document.createElement('div');
      media.className = 'cards-series-image';
      media.append(optimize(img, [{ width: '400' }]));
      imageHolder(img, row).remove();
      li.append(media);
    }

    const body = document.createElement('div');
    body.className = 'cards-series-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    [...body.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
    });
    [...body.children].forEach((el) => {
      const links = el.querySelectorAll('a[href]');
      if (!links.length || /^H[1-6]$/.test(el.tagName)) return;
      const text = [...links].map((a) => a.textContent.trim()).join('');
      if (el.textContent.trim() === text) el.classList.add('cards-series-actions');
    });
    if (body.childNodes.length) li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
