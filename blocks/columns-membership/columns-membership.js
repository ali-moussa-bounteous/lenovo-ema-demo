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

const hasContent = (el) => el.textContent.trim() || el.querySelector('img');
const isImageOnly = (el) => !el.textContent.trim() && !!el.querySelector('img');

/**
 * Columns (membership): contained promo banner on a background photo with a
 * brand logo column and a copy column (heading, bullet list, button).
 * Content: [logo] | [heading, list, link]. The background photo is either a
 * row of its own (a single image) or the first image of the copy cell.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  let bgImg = null;
  const logos = [];
  const copies = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children].filter(hasContent);
    if (cells.length === 1 && isImageOnly(cells[0]) && !bgImg
      && cells[0].querySelectorAll('img').length === 1) {
      [bgImg] = cells[0].querySelectorAll('img');
      return;
    }
    cells.forEach((cell) => {
      if (isImageOnly(cell)) {
        logos.push(cell);
        return;
      }
      const first = [...cell.children].find(hasContent);
      if (!bgImg && first && isImageOnly(first)) {
        bgImg = first.querySelector('img');
        imageHolder(bgImg, cell).remove();
      }
      copies.push(cell);
    });
  });

  const media = document.createElement('div');
  media.className = 'columns-membership-media';
  if (bgImg) {
    media.append(optimize(bgImg, [{ media: '(width >= 900px)', width: '2000' }, { width: '900' }]));
  }

  const inner = document.createElement('div');
  inner.className = 'columns-membership-inner';

  if (logos.length) {
    const logo = document.createElement('div');
    logo.className = 'columns-membership-logo';
    logos.forEach((cell) => {
      cell.querySelectorAll('img').forEach((img) => {
        const pic = optimize(img, [{ width: '400' }]);
        const link = img.closest('a');
        if (link) {
          const a = link.cloneNode(false);
          a.append(pic);
          logo.append(a);
        } else logo.append(pic);
      });
    });
    inner.append(logo);
  }

  const copy = document.createElement('div');
  copy.className = 'columns-membership-copy';
  copies.forEach((cell) => copy.append(...cell.childNodes));
  [...copy.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
  if (copy.childNodes.length) inner.append(copy);

  block.replaceChildren();
  if (bgImg) block.append(media);
  else block.classList.add('columns-membership-no-image');
  block.append(inner);
}
