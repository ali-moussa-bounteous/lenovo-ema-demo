/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-topic. Base: cards.
 * Source: https://www.lenovo.com/us/en/gaming/ (.left-img-right-txt) — 5 sibling matches
 * inside div.html_upload_content; together they form ONE cards-topic block (one row per topic).
 * The first match collects every sibling .left-img-right-txt, builds the block, and removes the
 * other siblings (the import script skips detached elements).
 * Output (2 columns): [photo | H3 linked title + description paragraph + "Explore All Articles" link paragraph]
 * The cleanup transformer renames the title h4 -> h3 (attributes kept), so the title is selected
 * as "any heading" inside .text-right-resources.
 * Iterates the block-level .left-img-right-txt wrappers, never the anchors.
 * Generated: 2026-10-12
 */
const ITEM_CLASS = 'left-img-right-txt';

function collectGroup(element) {
  const parent = element.parentElement;
  if (!parent) return [element];
  const group = [...parent.children].filter((c) => c.classList.contains(ITEM_CLASS));
  return group.length ? group : [element];
}

function buildRow(item, document) {
  const img = item.querySelector('.image-left-resources img, picture img, img');
  const text = item.querySelector('.text-right-resources') || item;

  const headingEl = text.querySelector('h1, h2, h3, h4, h5, h6');
  const headingLink = headingEl ? headingEl.querySelector('a[href]') : null;
  const title = headingEl ? headingEl.textContent.trim() : '';

  const descriptions = [...text.querySelectorAll('p')]
    .filter((p) => p.textContent.trim() && !(headingEl && headingEl.contains(p)));

  // Trailing CTA links: anchors in the text column that are not inside the heading
  const ctas = [...text.querySelectorAll('a[href]')]
    .filter((a) => !(headingEl && headingEl.contains(a)) && a.textContent.trim())
    .filter((a) => !descriptions.some((p) => p.contains(a) && p.textContent.trim() !== a.textContent.trim()));

  if (!img && !title && !descriptions.length) return null;

  const body = [];
  if (title) {
    const h3 = document.createElement('h3');
    if (headingLink) {
      const a = document.createElement('a');
      a.href = headingLink.getAttribute('href');
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    body.push(h3);
  }
  descriptions
    .filter((p) => !ctas.some((a) => p.contains(a)))
    .forEach((p) => {
      const np = document.createElement('p');
      np.textContent = p.textContent.trim();
      body.push(np);
    });
  ctas.forEach((cta) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.trim();
    const bold = cta.closest('strong, b') || cta.querySelector('strong, b');
    if (bold) {
      const strong = document.createElement('strong');
      strong.append(a);
      p.append(strong);
    } else {
      p.append(a);
    }
    body.push(p);
  });

  return [img || '', body];
}

export default function parse(element, { document }) {
  const group = collectGroup(element);

  const cells = [];
  group.forEach((item) => {
    const row = buildRow(item, document);
    if (row) cells.push(row);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Remove the other members of the group; they are now rows of this block.
  group.forEach((item) => { if (item !== element) item.remove(); });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-topic', cells });
  element.replaceWith(block);
}
