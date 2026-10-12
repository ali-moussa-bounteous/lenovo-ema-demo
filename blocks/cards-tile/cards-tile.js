import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
const GRID_MAX_ITEMS = 3;

function isImageCell(cell) {
  if (cell.children.length !== 1) return false;
  return !!(cell.querySelector(':scope > picture')
    || cell.querySelector(':scope > p > img')
    || cell.querySelector(':scope > p > picture'));
}

function buildTile(row) {
  const li = document.createElement('li');
  li.className = 'cards-tile-item';

  const cells = [...row.children];
  const imageCell = cells.find(isImageCell);
  const bodyCells = cells.filter((cell) => cell !== imageCell);

  const body = document.createElement('div');
  body.className = 'cards-tile-body';
  bodyCells.forEach((cell) => body.append(...cell.childNodes));

  // take the tile link: prefer a link-only paragraph, else the first link (e.g. in the heading)
  const links = [...body.querySelectorAll('a[href]')];
  const standalone = links.find((a) => {
    const p = a.closest('p');
    return p && p.parentElement === body && p.textContent.trim() === a.textContent.trim();
  });
  const link = standalone || links[0];
  const href = link ? link.href : null;
  if (standalone) standalone.closest('p').remove();
  else if (link) link.replaceWith(...link.childNodes);

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-tile-title');
  [...body.children].forEach((el) => {
    if (el !== heading) el.classList.add('cards-tile-description');
  });

  const label = document.createElement('div');
  label.className = 'cards-tile-label';
  label.append(...body.childNodes);
  body.append(label);

  const media = document.createElement('div');
  media.className = 'cards-tile-image';
  const img = imageCell && imageCell.querySelector('img');
  if (img) media.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]));

  const surface = document.createElement(href ? 'a' : 'div');
  surface.className = 'cards-tile-surface';
  if (href) surface.href = href;
  surface.append(media, body);
  li.append(surface);
  return li;
}

function buildScroller(block, list) {
  const controls = document.createElement('div');
  controls.className = 'cards-tile-controls';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-tile-prev';
  prev.setAttribute('aria-label', 'Previous items');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-tile-next';
  next.setAttribute('aria-label', 'Next items');

  const progress = document.createElement('div');
  progress.className = 'cards-tile-progress';
  progress.setAttribute('aria-hidden', 'true');
  const bar = document.createElement('span');
  bar.className = 'cards-tile-progress-bar';
  progress.append(bar);

  controls.append(prev, next, progress);
  block.append(controls);

  const step = () => {
    const item = list.querySelector('.cards-tile-item');
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return item ? item.getBoundingClientRect().width + gap : list.clientWidth;
  };

  const update = () => {
    const max = list.scrollWidth - list.clientWidth;
    const visible = list.scrollWidth ? list.clientWidth / list.scrollWidth : 1;
    const ratio = max > 0 ? list.scrollLeft / max : 0;
    bar.style.width = `${Math.min(100, visible * 100)}%`;
    bar.style.left = `${ratio * (100 - Math.min(100, visible * 100))}%`;
    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft >= max - 1;
  };

  prev.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: 'smooth' }));
  list.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(list);
  update();
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const list = document.createElement('ul');
  list.className = 'cards-tile-list';
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    list.append(buildTile(row));
  });

  block.replaceChildren(list);

  if (list.children.length > GRID_MAX_ITEMS) {
    block.classList.add('is-scroller');
    list.setAttribute('tabindex', '0');
    list.setAttribute('aria-label', 'Scrollable list');
    buildScroller(block, list);
  }
}
