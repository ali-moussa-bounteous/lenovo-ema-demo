/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-links. Base: columns.
 * Source: https://www.lenovo.com/us/en/gaming/ (.shop-links-ul) — 2 matches ('Shop', 'Explore'),
 * each in its own CMS slot (layouts_special_2columns11_left / _right). Together they form ONE
 * columns-links block: one row, one cell per panel.
 * The first match finds the nearest ancestor holding all panels, builds the block in place and
 * removes the other panels (the import script skips detached elements).
 * Cell content: H2 heading + bulleted list of links + decorative image (last).
 * The cleanup transformer renames the panel heading h5 -> h2 and removes the trailing empty <li>;
 * empty items are filtered here as well.
 * Generated: 2026-10-12
 */
const PANEL_SELECTOR = '.shop-links-ul';
const MAX_DEPTH = 8;

function collectGroup(element) {
  let ancestor = element.parentElement;
  for (let depth = 0; ancestor && depth < MAX_DEPTH; depth += 1) {
    if (ancestor.matches('main, body')) break;
    const panels = [...ancestor.querySelectorAll(PANEL_SELECTOR)]
      .filter((p) => !p.parentElement.closest(PANEL_SELECTOR));
    if (panels.length > 1) return panels;
    ancestor = ancestor.parentElement;
  }
  return [element];
}

function buildCell(panel, document) {
  const headingEl = panel.querySelector('h1, h2, h3, h4, h5, h6');
  const links = [...panel.querySelectorAll('li a[href]')].filter((a) => a.textContent.trim());
  // Fallback when the links are not in a list
  if (!links.length) {
    links.push(...[...panel.querySelectorAll('a[href]')].filter((a) => a.textContent.trim()));
  }
  const img = panel.querySelector('.image-right-middle img, figure img, picture img, img');

  if (!headingEl && !links.length && !img) return null;

  const cell = [];
  if (headingEl && headingEl.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = headingEl.textContent.trim();
    cell.push(h2);
  }
  if (links.length) {
    const ul = document.createElement('ul');
    links.forEach((link) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      li.append(a);
      ul.append(li);
    });
    cell.push(ul);
  }
  if (img) cell.push(img);
  return cell;
}

export default function parse(element, { document }) {
  const panels = collectGroup(element);

  const row = [];
  panels.forEach((panel) => {
    const cell = buildCell(panel, document);
    if (cell) row.push(cell);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  panels.forEach((panel) => { if (panel !== element) panel.remove(); });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-links', cells });
  element.replaceWith(block);
}
