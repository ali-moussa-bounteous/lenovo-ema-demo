import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/** Element (p or bare) carries only an image. */
function isImageOnly(el) {
  return !!(el.matches('picture, img') || el.querySelector('picture, img'))
    && el.textContent.trim() === '';
}

function buildPanel(cell) {
  const panel = document.createElement('div');
  panel.className = 'columns-links-panel';

  const text = document.createElement('div');
  text.className = 'columns-links-text';
  const media = document.createElement('div');
  media.className = 'columns-links-image';

  // a lone <p> wrapping the whole cell (published markup) is transparent
  const kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('ul, ol, picture, img')) {
    kids[0].replaceWith(...kids[0].childNodes);
  }

  [...cell.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) text.append(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (isImageOnly(node) && !media.querySelector('img')) {
      const img = node.matches('img') ? node : node.querySelector('img');
      const picture = createOptimizedPicture(img.src, img.alt || '', false, [
        { media: '(width >= 900px)', width: '600' },
        { width: '400' },
      ]);
      const newImg = picture.querySelector('img');
      // the panel image is decorative per the content contract; imported alts
      // are placeholders (e.g. "img12") that would only add noise for screen readers
      newImg.alt = '';
      if (img.getAttribute('width') && img.getAttribute('height')) {
        newImg.width = img.getAttribute('width');
        newImg.height = img.getAttribute('height');
      }
      media.append(picture);
      return;
    }
    if (isImageOnly(node)) return; // extra images are dropped
    text.append(node);
  });

  const heading = text.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('columns-links-title');

  // links inside the lists stay plain text links even when authored bold
  text.querySelectorAll('ul, ol').forEach((list) => {
    list.classList.add('columns-links-list');
    list.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
    list.querySelectorAll('a.button').forEach((a) => {
      a.classList.remove('button', 'accent', 'primary', 'secondary');
      if (!a.classList.length) a.removeAttribute('class');
    });
  });

  panel.append(text);
  if (media.querySelector('img')) panel.append(media);
  else panel.classList.add('columns-links-no-image');
  return panel;
}

/**
 * Link panels: one row, one cell per panel. Each cell = heading, bulleted link
 * list and an optional decorative image (anchored bottom-right).
 * Extra rows are flattened into additional panels.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const cells = [...block.querySelectorAll(':scope > div > div')]
    .filter((cell) => cell.textContent.trim() || cell.querySelector('picture, img'));
  const panels = cells.map(buildPanel);
  block.replaceChildren(...panels);
  block.classList.add(`columns-links-${panels.length}-cols`);
}
