import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let instance = 0;

function optimize(img, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', false, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/** Removes an image and its wrapping <picture>/<p> when they become empty. */
function detachImage(img) {
  const holder = img.closest('picture') || img;
  const p = holder.parentElement && holder.parentElement.closest('p');
  holder.remove();
  if (p && !p.textContent.trim() && !p.querySelector('img, a')) p.remove();
}

function setExpanded(button, panel, expanded) {
  button.setAttribute('aria-expanded', String(expanded));
  panel.hidden = !expanded;
  button.closest('.cards-reveal-item').classList.toggle('is-expanded', expanded);
}

/**
 * Builds one tile from an authored row.
 * Row: cell 1 = photo; cell 2 = icon image, heading, description.
 * Images are taken in order wherever they sit (first = photo, second = icon).
 */
function buildItem(row, index, blockId) {
  const imgs = [...row.querySelectorAll('img')];
  const [photo, icon] = imgs;
  const li = document.createElement('li');
  li.className = 'cards-reveal-item';

  if (photo) {
    const media = document.createElement('div');
    media.className = 'cards-reveal-image';
    media.append(optimize(photo, [{ media: '(width >= 600px)', width: '500' }, { width: '400' }]));
    li.append(media);
  }

  const body = document.createElement('div');
  body.className = 'cards-reveal-body';
  if (icon) {
    const iconWrap = document.createElement('div');
    iconWrap.className = 'cards-reveal-icon';
    iconWrap.append(optimize(icon, [{ width: '120' }]));
    body.append(iconWrap);
  }
  imgs.forEach(detachImage);

  // remaining content, in authored order
  const content = [];
  [...row.children].forEach((cell) => {
    [...cell.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        if (n.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = n.textContent.trim();
          content.push(p);
        }
      } else if (n.nodeType === Node.ELEMENT_NODE && n.textContent.trim()) {
        content.push(n);
      }
    });
  });

  let title = content.find((el) => /^H[1-6]$/.test(el.tagName));
  if (!title && content.length) [title] = content;
  const rest = content.filter((el) => el !== title);

  if (title) {
    title.classList.add('cards-reveal-title');
    body.append(title);
  }
  li.append(body);

  if (title && rest.length) {
    const panelId = `cards-reveal-${blockId}-${index}`;
    const panel = document.createElement('div');
    panel.className = 'cards-reveal-description';
    panel.id = panelId;
    panel.append(...rest);
    li.append(panel);

    // the title becomes a disclosure button so the description is reachable
    // by keyboard and by tap, not only by mouse hover
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-reveal-toggle';
    button.setAttribute('aria-controls', panelId);
    button.append(...title.childNodes);
    title.append(button);
    setExpanded(button, panel, false);
  }
  return li;
}

/**
 * Cards (reveal): row of tall photo tiles with an icon and title; each tile's
 * description is revealed on hover, on keyboard focus, or by tapping the
 * title (a disclosure button with aria-expanded).
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  instance += 1;
  const ul = document.createElement('ul');
  [...block.children].forEach((row, i) => {
    if (!row.textContent.trim() && !row.querySelector('img')) return;
    ul.append(buildItem(row, i, instance));
  });

  ul.addEventListener('click', (e) => {
    const button = e.target.closest('.cards-reveal-toggle');
    if (!button) return;
    const panel = ul.querySelector(`#${button.getAttribute('aria-controls')}`);
    setExpanded(button, panel, button.getAttribute('aria-expanded') !== 'true');
  });
  ul.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const item = e.target.closest('.cards-reveal-item');
    const button = item && item.querySelector('.cards-reveal-toggle[aria-expanded="true"]');
    if (!button) return;
    setExpanded(button, ul.querySelector(`#${button.getAttribute('aria-controls')}`), false);
    button.focus();
  });

  block.replaceChildren(ul);
}
