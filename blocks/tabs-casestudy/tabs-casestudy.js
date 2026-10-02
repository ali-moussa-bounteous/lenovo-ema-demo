import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let casestudyCount = 0;

function isLinkOnly(p) {
  const links = p.querySelectorAll('a');
  return links.length > 0
    && p.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
}

/** Marks a leading short, link-free paragraph as the tile eyebrow ("The impact"). */
function markEyebrow(tile) {
  const first = tile.firstElementChild;
  if (first && first.tagName === 'P' && !first.querySelector('a, img')
    && first.nextElementSibling) {
    first.classList.add('tabs-casestudy-eyebrow');
  }
}

function decorateIntro(cell) {
  cell.className = 'tabs-casestudy-intro';
  const text = document.createElement('div');
  text.className = 'tabs-casestudy-intro-text';
  const cta = document.createElement('div');
  cta.className = 'tabs-casestudy-cta';
  [...cell.children].forEach((el) => {
    if (el.tagName === 'P' && isLinkOnly(el)) cta.append(el);
    else text.append(el);
  });
  cell.replaceChildren(text);
  if (cta.children.length) cell.append(cta);
  return cell;
}

function decorateImpact(cell) {
  cell.className = 'tabs-casestudy-tile tabs-casestudy-impact';
  markEyebrow(cell);
  const quote = cell.querySelector('blockquote');
  if (quote) {
    quote.classList.add('tabs-casestudy-quote');
    const after = [];
    let next = quote.nextElementSibling;
    while (next) {
      after.push(next);
      next = next.nextElementSibling;
    }
    if (after.length) {
      const author = document.createElement('div');
      author.className = 'tabs-casestudy-author';
      author.append(...after);
      cell.append(author);
    }
  }
  return cell;
}

function decorateHow(cell) {
  cell.className = 'tabs-casestudy-tile tabs-casestudy-how';
  markEyebrow(cell);
  cell.querySelectorAll(':scope > ul > li, :scope > ol > li').forEach((li) => {
    li.classList.add('tabs-casestudy-solution');
    const img = li.querySelector('img');
    if (!img) return;
    const icon = document.createElement('span');
    icon.className = 'tabs-casestudy-solution-icon';
    const isSvg = /\.svg(\?|$)/i.test(img.getAttribute('src') || '');
    const holder = img.closest('picture') || img;
    icon.append(isSvg ? img : createOptimizedPicture(img.src, img.alt, false, [{ width: '64' }]));
    if (holder !== img || !isSvg) holder.remove();
    li.prepend(icon);
    // wrap remaining label text
    const label = document.createElement('span');
    label.className = 'tabs-casestudy-solution-label';
    [...li.childNodes].filter((n) => n !== icon).forEach((n) => label.append(n));
    label.querySelectorAll(':scope > p').forEach((p) => {
      if (!p.textContent.trim() && !p.children.length) p.remove();
    });
    // published markup wraps the label text in its own <p>; keep it inline
    const paragraphs = label.querySelectorAll(':scope > p');
    if (paragraphs.length === 1) paragraphs[0].replaceWith(...paragraphs[0].childNodes);
    li.append(label);
  });
  return cell;
}

function decorateStats(cell) {
  cell.className = 'tabs-casestudy-stats';
  const stats = [];
  let current = null;
  [...cell.children].forEach((el) => {
    if (el.matches('h1, h2, h3, h4, h5, h6') || !current) {
      current = document.createElement('div');
      current.className = 'tabs-casestudy-tile tabs-casestudy-stat';
      stats.push(current);
    }
    if (el.matches('h1, h2, h3, h4, h5, h6')) el.classList.add('tabs-casestudy-stat-value');
    current.append(el);
  });
  cell.replaceChildren(...stats);
  return cell;
}

const TILE_DECORATORS = [decorateImpact, decorateHow, decorateStats];

function buildPanelContent(cells) {
  const fragment = [];
  const [introCell, ...tileCells] = cells;
  if (introCell) fragment.push(decorateIntro(introCell));
  if (tileCells.length) {
    const tiles = document.createElement('div');
    tiles.className = 'tabs-casestudy-tiles';
    tileCells.forEach((cell, i) => {
      const decorateTile = TILE_DECORATORS[i];
      if (decorateTile) tiles.append(decorateTile(cell));
      else {
        cell.className = 'tabs-casestudy-tile';
        tiles.append(cell);
      }
    });
    fragment.push(tiles);
  }
  return fragment;
}

export default function decorate(block) {
  casestudyCount += 1;
  const id = casestudyCount;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const tablist = document.createElement('div');
  tablist.className = 'tabs-casestudy-list';
  tablist.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-casestudy-panels';

  const tabs = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells.shift();
    if (!labelCell || !labelCell.textContent.trim()) return;

    const index = tabs.length;
    const slug = toClassName(labelCell.textContent) || `tab-${index}`;
    const tabId = `tabs-casestudy-${id}-tab-${slug}-${index}`;
    const panelId = `tabs-casestudy-${id}-panel-${slug}-${index}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-casestudy-tab';
    tab.id = tabId;
    tab.textContent = labelCell.textContent.trim();
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);

    const panel = document.createElement('div');
    panel.className = 'tabs-casestudy-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.setAttribute('tabindex', '0');
    panel.append(...buildPanelContent(cells.filter((c) => c.textContent.trim() || c.querySelector('img'))));

    tablist.append(tab);
    panels.append(panel);
    tabs.push({ tab, panel });
  });

  const select = (index, focus = false) => {
    tabs.forEach(({ tab, panel }, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected);
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panel.hidden = !selected;
    });
    if (focus) tabs[index].tab.focus();
  };

  tabs.forEach(({ tab }, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowRight') target = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') target = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = tabs.length - 1;
      if (target !== null) {
        e.preventDefault();
        select(target, true);
      }
    });
  });

  block.replaceChildren(tablist, panels);
  if (tabs.length) select(0);
}
