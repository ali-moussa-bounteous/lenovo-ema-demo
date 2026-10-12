import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function isImageCell(cell) {
  if (cell.children.length !== 1) return false;
  return !!(cell.querySelector(':scope > picture')
    || cell.querySelector(':scope > p > img')
    || cell.querySelector(':scope > p > picture'));
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-category-item';

    const cells = [...row.children];
    const imageCell = cells.find(isImageCell);
    const labelCells = cells.filter((cell) => cell !== imageCell);

    const image = document.createElement('div');
    image.className = 'cards-category-image';
    const img = imageCell && imageCell.querySelector('img');
    if (img) image.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '300' }]));

    const label = document.createElement('div');
    label.className = 'cards-category-label';
    labelCells.forEach((cell) => label.append(...cell.childNodes));

    // the whole item links to the category
    const link = label.querySelector('a[href]');
    if (link) {
      const anchor = document.createElement('a');
      anchor.className = 'cards-category-link';
      anchor.href = link.href;
      if (link.title) anchor.title = link.title;
      link.replaceWith(...link.childNodes);
      // strip button decoration from a label that was authored bold
      label.querySelectorAll('.button-wrapper').forEach((p) => p.classList.remove('button-wrapper'));
      if (img) anchor.append(image);
      anchor.append(label);
      li.append(anchor);
    } else {
      if (img) li.append(image);
      li.append(label);
    }

    if (li.textContent.trim() || img) ul.append(li);
  });

  block.replaceChildren(ul);
}
