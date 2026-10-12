import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/** Returns the image if the element holds nothing but an image. */
function onlyImage(el) {
  if (!el || el.textContent.trim() !== '') return null;
  const imgs = el.querySelectorAll('img');
  return imgs.length === 1 ? imgs[0] : null;
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  let background = null;
  const cols = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    // image-only row (one cell or all cells image-only) = panel background
    if (!background && cells.length && cells.every((c) => onlyImage(c) || !c.textContent.trim())
      && cells.some((c) => onlyImage(c))) {
      const img = onlyImage(cells.find((c) => onlyImage(c)));
      background = document.createElement('div');
      background.className = 'columns-rewards-bg';
      background.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '1600' }]));
      return;
    }
    cells.forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('img')) cols.push(cell);
    });
  });

  const inner = document.createElement('div');
  inner.className = 'columns-rewards-inner';
  cols.forEach((col) => {
    const hasList = col.querySelector(':scope > ul, :scope > ol');
    const hasHeading = col.querySelector('h1, h2, h3, h4, h5, h6');
    col.className = hasList && !hasHeading ? 'columns-rewards-list' : 'columns-rewards-content';

    if (col.classList.contains('columns-rewards-content')) {
      // group trailing link-only paragraphs (Join Free / Learn More) into one action row
      const ctas = [...col.querySelectorAll(':scope > p')].filter((p) => {
        const links = p.querySelectorAll('a');
        return links.length && p.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
      });
      if (ctas.length) {
        const actions = document.createElement('div');
        actions.className = 'columns-rewards-actions';
        ctas[0].before(actions);
        actions.append(...ctas);
      }
    }
    inner.append(col);
  });

  block.replaceChildren(...[background, inner].filter(Boolean));
  if (background) block.classList.add('has-bg');
}
