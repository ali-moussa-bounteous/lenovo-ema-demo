/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (section.x-cms-ai-ofp-fe-2c-accordion)
 *   — 1 instance, 50 Q/A items.
 * Output (2 columns, one row per item): [ question (plain text) | answer paragraph(s) with inline links ]
 *
 * Iteration is keyed on the block-level article.x-cms-ai-ofp-fe-2c-accordion__item wrappers.
 * Question: button.__tab-label > span.__label-text > p (text only; the +/- icon is dropped).
 * Answer:   div.__content children (p / ul / ol ...), inline links kept with their real hrefs.
 * All 50 answers are present in the DOM (collapsed, not lazy-loaded).
 * Generated: 2026-10-15 (laptops template)
 */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('article.x-cms-ai-ofp-fe-2c-accordion__item')];
  if (!items.length) items = [...element.querySelectorAll('[class*="accordion__item"]')];

  const cells = [];
  items.forEach((item) => {
    const labelEl = item.querySelector('[class*="accordion__label-text"]')
      || item.querySelector('[class*="accordion__tab-label"]');
    const question = clean(labelEl && labelEl.textContent);
    const content = item.querySelector('[class*="accordion__content"]');
    if (!question || !content) return;

    const answer = [];
    [...content.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        if (clean(n.textContent)) {
          const p = document.createElement('p');
          p.textContent = clean(n.textContent);
          answer.push(p);
        }
        return;
      }
      if (n.nodeType !== 1) return;
      if (!clean(n.textContent) && !n.querySelector('img')) return;
      if (/^(P|UL|OL|TABLE|H[1-6]|BLOCKQUOTE)$/.test(n.tagName)) {
        answer.push(n);
      } else {
        // inline / div wrapper: keep its markup in a paragraph
        const p = document.createElement('p');
        p.innerHTML = n.tagName === 'DIV' ? n.innerHTML : n.outerHTML;
        answer.push(p);
      }
    });
    if (!answer.length) return;

    cells.push([question, answer]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
