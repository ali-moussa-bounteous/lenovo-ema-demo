import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function trimWhitespace(el) {
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
}

function optimize(img, eager, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', eager, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/** A cell whose only content is a single image (picture/img, optionally in a <p>). */
function isImageOnlyCell(cell) {
  return cell.querySelectorAll('img').length === 1 && cell.textContent.trim() === '';
}

/**
 * Hero brand: full-bleed background photo with centred logo, heading and CTA.
 * Row 1 = background photo; row 2 = logo image, heading, link(s).
 * Tolerates a single cell with everything (first image becomes the background
 * only when it sits alone in its own cell), extra rows, or no image at all.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const cells = [...block.querySelectorAll(':scope > div > div')];
  const bgCell = cells.find(isImageOnlyCell);

  const media = document.createElement('div');
  media.className = 'hero-brand-media';
  if (bgCell) {
    const img = bgCell.querySelector('img');
    // first visible image on the page: load eagerly
    const picture = optimize(img, true, [
      { media: '(width >= 900px)', width: '2000' },
      { width: '900' },
    ]);
    picture.querySelector('img').setAttribute('fetchpriority', 'high');
    media.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'hero-brand-content';
  cells.filter((cell) => cell !== bgCell).forEach((cell) => {
    content.append(...cell.childNodes);
  });
  trimWhitespace(content);

  // logo / badge images inside the content: optimise, keep their links
  content.querySelectorAll('img').forEach((img) => {
    const old = img.closest('picture') || img;
    const picture = optimize(img, true, [{ width: '600' }]);
    old.replaceWith(picture);
    const p = picture.closest('p');
    if (p && p.textContent.trim() === '' && !p.querySelector('a')) p.classList.add('hero-brand-logo');
    const a = picture.closest('a');
    if (a) {
      a.classList.add('hero-brand-badge');
      const wrap = a.closest('p') || a;
      wrap.classList.add('hero-brand-badge-wrapper');
    }
  });

  block.replaceChildren();
  if (bgCell) block.append(media);
  else block.classList.add('hero-brand-no-image');
  if (content.childNodes.length) block.append(content);
}
