/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo. Base: cards.
 * Source: https://www.lenovo.com/us/en/gaming/ (.edu-right-box-bg-img) — 2 sibling matches
 * inside the sidebar div.html_upload_content; together they form ONE cards-promo block
 * (one row per promo box). The first match collects every sibling box, builds the block and
 * removes the other siblings (the import script skips detached elements).
 * Output (1 column): [H3 title + description paragraph + link-only CTA paragraph]
 * The cleanup transformer renames div.edu-font-bold-big-black -> h3 (class kept), so the title is
 * selected by class first, then by any heading.
 *
 * Iteration safety: the CTA markup is div.cta-wrapper > button.cta-button > a[href] (an anchor
 * nested in a button). Iteration is keyed on the block-level .edu-right-box-bg-img wrappers
 * (expected 2), never on the anchors/buttons. Each part is read from inside its own box wrapper
 * (the box is a direct child of the shared parent, so it never spans several items). If a re-parse
 * lifted the anchor out of the button, it still sits inside the box's .cta-wrapper or the box
 * itself, which is what the CTA lookup searches.
 * Generated: 2026-10-12
 */
const ITEM_CLASS = 'edu-right-box-bg-img';

function collectGroup(element) {
  const parent = element.parentElement;
  if (!parent) return [element];
  const group = [...parent.children].filter((c) => c.classList.contains(ITEM_CLASS));
  return group.length ? group : [element];
}

function buildCell(box, document) {
  const titleEl = box.querySelector('.edu-font-bold-big-black')
    || box.querySelector('h1, h2, h3, h4, h5, h6');

  let textEls = [...box.querySelectorAll('.edu-font-normal-big-black')];
  if (!textEls.length) {
    textEls = [...box.querySelectorAll('p')].filter((p) => !p.closest('.cta-wrapper'));
  }

  // CTA anchors scoped to this box: inside .cta-wrapper first, then anywhere in the box.
  const ctaWrap = box.querySelector('.cta-wrapper');
  let ctas = ctaWrap ? [...ctaWrap.querySelectorAll('a[href]')] : [];
  if (!ctas.length) ctas = [...box.querySelectorAll('a[href]')];

  const title = titleEl ? titleEl.textContent.trim() : '';
  const texts = textEls.map((t) => t.textContent.trim()).filter(Boolean);
  if (!title && !texts.length && !ctas.length) return null;

  const cell = [];
  if (title) {
    const h3 = document.createElement('h3');
    h3.textContent = title;
    cell.push(h3);
  }
  texts.forEach((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    cell.push(p);
  });
  ctas.forEach((cta) => {
    const label = cta.textContent.trim();
    if (!label) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = label;
    p.append(a);
    cell.push(p);
  });
  return cell;
}

export default function parse(element, { document }) {
  const boxes = collectGroup(element);

  const cells = [];
  boxes.forEach((box) => {
    const cell = buildCell(box, document);
    if (cell) cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  boxes.forEach((box) => { if (box !== element) box.remove(); });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
