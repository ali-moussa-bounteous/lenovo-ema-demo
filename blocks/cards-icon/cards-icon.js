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
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    const li = document.createElement('li');
    li.className = 'cards-icon-item';

    const cells = [...row.children];
    const iconCell = cells.find(isImageCell);
    const bodyCells = cells.filter((cell) => cell !== iconCell);

    const img = iconCell && iconCell.querySelector('img');
    if (img) {
      const icon = document.createElement('div');
      icon.className = 'cards-icon-icon';
      const isSvg = /\.svg(\?|$)/i.test(img.getAttribute('src') || '');
      icon.append(isSvg ? img : createOptimizedPicture(img.src, img.alt, false, [{ width: '96' }]));
      li.append(icon);
    }

    const body = document.createElement('div');
    body.className = 'cards-icon-body';
    bodyCells.forEach((cell) => body.append(...cell.childNodes));

    // trailing link-only paragraph is the item's text link
    const last = body.lastElementChild;
    const lastLink = last && last.querySelector('a[href]');
    if (lastLink && last.textContent.trim() === lastLink.textContent.trim()) {
      last.classList.add('cards-icon-link');
    }

    li.append(body);
    ul.append(li);
  });

  block.replaceChildren(ul);
}
