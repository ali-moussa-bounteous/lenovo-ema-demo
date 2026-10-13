import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Returns true when a cell only carries an image (picture/img, optionally
 * wrapped in a <p>), ignoring whitespace text nodes.
 * @param {Element} cell
 */
function isImageCell(cell) {
  if (!cell.querySelector('picture, img')) return false;
  return cell.textContent.trim() === '';
}

/**
 * Hero banner: a contained photo with a heading and intro text layered over it.
 * Row 1 = image, row 2 = heading + text. Tolerates a single row with both,
 * extra rows, image-only, or text-only content.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const cells = [...block.querySelectorAll(':scope > div > div')];
  const imageCell = cells.find(isImageCell);
  const img = (imageCell || block).querySelector('img');

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  if (img) {
    // first visible image on the page: load eagerly
    const picture = createOptimizedPicture(img.src, img.alt || '', true, [
      { media: '(width >= 900px)', width: '2000' },
      { width: '900' },
    ]);
    const newImg = picture.querySelector('img');
    newImg.setAttribute('fetchpriority', 'high');
    if (img.width && img.height) {
      newImg.width = img.width;
      newImg.height = img.height;
    }
    media.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  cells.filter((cell) => cell !== imageCell).forEach((cell) => {
    // drop any stray images in text cells (the banner shows one image)
    cell.querySelectorAll('picture, img').forEach((el) => {
      const p = el.closest('p');
      if (p && p.parentElement === cell && p.textContent.trim() === '') p.remove();
      else el.remove();
    });
    content.append(...cell.childNodes);
  });
  // trim whitespace-only text nodes
  [...content.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  block.replaceChildren();
  if (img) block.append(media);
  else block.classList.add('hero-banner-no-image');
  if (content.childNodes.length) block.append(content);
}
