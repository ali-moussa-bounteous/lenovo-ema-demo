import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let promptCount = 0;

/** Returns the image of an element that is only an image (picture, or p > img / p > picture). */
function onlyImage(el) {
  if (!el || el.textContent.trim() !== '') return null;
  if (el.tagName === 'PICTURE') return el.querySelector('img');
  if (el.tagName === 'IMG') return el;
  if (el.tagName === 'P' && el.children.length === 1) return el.querySelector(':scope > img, :scope > picture > img');
  return null;
}

/**
 * Groups a flat cell of sequential content (image, heading, text, link, image, heading...)
 * into result items. A new item starts at an image, or at a heading when the current
 * item already has a heading.
 */
function groupResults(cell) {
  const groups = [];
  let current = null;
  [...cell.children].forEach((el) => {
    const isImage = !!onlyImage(el);
    const isHeading = el.matches('h1, h2, h3, h4, h5, h6');
    const startNew = !current
      || (isImage && (current.image || current.body.length))
      || (isHeading && current.body.some((b) => b.matches('h1, h2, h3, h4, h5, h6')));
    if (startNew) {
      current = { image: null, body: [] };
      groups.push(current);
    }
    if (isImage && !current.image) current.image = onlyImage(el);
    else current.body.push(el);
  });
  return groups;
}

function buildResults(cell) {
  const list = document.createElement('ul');
  list.className = 'tabs-prompt-results';
  groupResults(cell).forEach(({ image, body }) => {
    const item = document.createElement('li');
    item.className = 'tabs-prompt-result';
    if (image) {
      const media = document.createElement('div');
      media.className = 'tabs-prompt-result-image';
      media.append(createOptimizedPicture(image.src, image.alt, false, [{ width: '600' }]));
      item.append(media);
    }
    const content = document.createElement('div');
    content.className = 'tabs-prompt-result-body';
    content.append(...body);
    item.append(content);
    list.append(item);
  });
  return list;
}

export default function decorate(block) {
  promptCount += 1;
  const id = promptCount;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.children];
  const intro = document.createElement('div');
  intro.className = 'tabs-prompt-intro';
  const list = document.createElement('div');
  list.className = 'tabs-prompt-list';
  const panels = document.createElement('div');
  panels.className = 'tabs-prompt-panels';
  let background = null;

  const buttons = [];
  rows.forEach((row) => {
    const cells = [...row.children].filter((c) => c.textContent.trim() || c.querySelector('img'));
    if (cells.length === 0) return;

    // single-cell rows: intro heading/text and optional panel background image
    if (cells.length === 1) {
      [...cells[0].children].forEach((el) => {
        const img = onlyImage(el);
        if (img && !background) {
          background = document.createElement('div');
          background.className = 'tabs-prompt-bg';
          background.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '1600' }]));
        } else {
          intro.append(el);
        }
      });
      return;
    }

    const [labelCell, ...resultCells] = cells;
    const index = buttons.length;
    const slug = toClassName(labelCell.textContent) || `prompt-${index}`;
    const buttonId = `tabs-prompt-${id}-button-${slug}-${index}`;
    const panelId = `tabs-prompt-${id}-panel-${slug}-${index}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-prompt-button';
    button.id = buttonId;
    button.textContent = labelCell.textContent.trim();
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);

    const panel = document.createElement('div');
    panel.className = 'tabs-prompt-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;
    const merged = document.createElement('div');
    resultCells.forEach((cell) => merged.append(...cell.children));
    panel.append(buildResults(merged));

    list.append(button);
    panels.append(panel);
    buttons.push({ button, panel });
  });

  // only one result set is visible at a time; selecting the open prompt closes it
  buttons.forEach(({ button, panel }) => {
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      buttons.forEach((b) => {
        b.button.setAttribute('aria-expanded', 'false');
        b.panel.hidden = true;
      });
      if (!open) {
        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
      block.classList.toggle('is-open', !open);
    });
  });

  const inner = document.createElement('div');
  inner.className = 'tabs-prompt-inner';
  if (intro.children.length) inner.append(intro);
  inner.append(list, panels);

  block.replaceChildren(...[background, inner].filter(Boolean));
  if (background) block.classList.add('has-bg');
}
