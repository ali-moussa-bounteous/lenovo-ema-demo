import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/** Cell carries only an image (picture/img, maybe inside a <p>). */
function isImageCell(cell) {
  return !!cell.querySelector('picture, img') && cell.textContent.trim() === '';
}

/** Unwrap a lone <p> that wraps the whole cell (published markup quirk). */
function unwrapLoneParagraph(el) {
  const kids = [...el.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) {
    kids[0].replaceWith(...kids[0].childNodes);
  }
}

/** A <p> whose only meaningful content is one link (optionally wrapped in strong/em). */
function isLinkOnlyParagraph(p) {
  const links = p.querySelectorAll('a[href]');
  return p.tagName === 'P' && links.length === 1
    && p.textContent.trim() === links[0].textContent.trim();
}

function buildItem(row) {
  const li = document.createElement('li');
  li.className = 'cards-topic-item';

  const cells = [...row.children];
  const imageCell = cells.find(isImageCell);

  if (imageCell) {
    const img = imageCell.querySelector('img');
    const media = document.createElement('div');
    media.className = 'cards-topic-image';
    const picture = createOptimizedPicture(img.src, img.alt || '', false, [
      { media: '(width >= 600px)', width: '750' },
      { width: '600' },
    ]);
    // keep the intrinsic size so the browser reserves the image's space (no layout shift)
    const newImg = picture.querySelector('img');
    if (img.getAttribute('width') && img.getAttribute('height')) {
      newImg.width = img.getAttribute('width');
      newImg.height = img.getAttribute('height');
    }
    media.append(picture);
    li.append(media);
  }

  const body = document.createElement('div');
  body.className = 'cards-topic-body';
  cells.filter((c) => c !== imageCell).forEach((cell) => {
    unwrapLoneParagraph(cell);
    body.append(...cell.childNodes);
  });
  [...body.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-topic-title');

  const paragraphs = [...body.querySelectorAll(':scope > p')];
  const cta = paragraphs.reverse().find((p) => isLinkOnlyParagraph(p) && !p.contains(heading));
  if (cta) {
    // global decorateButtons turns bold link-only paragraphs into buttons;
    // this design shows a plain text link, so undo that treatment
    cta.className = 'cards-topic-link';
    const a = cta.querySelector('a');
    a.classList.remove('button', 'accent', 'primary', 'secondary');
    if (!a.classList.length) a.removeAttribute('class');
  }

  li.append(body);
  if (!imageCell) li.classList.add('cards-topic-no-image');
  return li;
}

/**
 * Topic list: one row per topic, cell 1 = image, cell 2 = linked heading,
 * description and an "explore" link. Rendered as a single-column list of
 * image-left / text-right items.
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
