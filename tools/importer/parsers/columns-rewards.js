/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-rewards. Base: columns.
 * Source: https://www.lenovo.com/us/en/ (.content-package-banner)
 * Output:
 *   - optional image-only row: [background image | ''] (panel background)
 *   - content row: [H2 heading + paragraph + link-only CTA paragraphs (first in <strong>) | <ul> benefits]
 * Generated: 2026-09-29
 */
export default function parse(element, { document }) {
  const cells = [];

  // Background: main creative background image (skip decorative alpha layers)
  const bg = element.querySelector('.len-content-package-banner-bg-image > .picture-tag img')
    || element.querySelector('[class*="bg-image--main"] img, [class*="banner-bg-image"] img');

  // Content column
  const content = [];
  const wrap = element.querySelector('.content-package-banner-content__wrap')
    || element.querySelector('.content-package-banner-left')
    || element;
  const headingEl = wrap.querySelector('h1, h2, h3, .display-headline-4xlg, p[class*="headline"]');
  if (headingEl) {
    const h2 = document.createElement('h2');
    h2.textContent = headingEl.textContent.trim();
    content.push(h2);
  }
  [...wrap.querySelectorAll('p')]
    .filter((p) => p !== headingEl && p.textContent.trim())
    .forEach((p) => {
      const para = document.createElement('p');
      para.innerHTML = p.innerHTML;
      content.push(para);
    });

  let ctas = [...element.querySelectorAll('.content-package-banner-actions a[href]')];
  if (!ctas.length) ctas = [...element.querySelectorAll('.content-package-banner-left a.cta[href]')];
  ctas.forEach((a, i) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const p = document.createElement('p');
    if (i === 0) {
      const strong = document.createElement('strong');
      strong.append(link);
      p.append(strong);
    } else {
      p.append(link);
    }
    content.push(p);
  });

  // Benefits list column: source uses <p> per benefit (or li)
  const listSrc = element.querySelector('.content-package-banner__list');
  const ul = document.createElement('ul');
  if (listSrc) {
    const entries = listSrc.querySelectorAll('li').length
      ? [...listSrc.querySelectorAll('li')]
      : [...listSrc.querySelectorAll('p')];
    entries.forEach((e) => {
      const text = e.textContent.trim();
      if (!text) return;
      const li = document.createElement('li');
      li.innerHTML = e.innerHTML.trim();
      ul.append(li);
    });
  }

  if (!content.length && !ul.children.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (bg) cells.push([bg, '']);
  cells.push([content, ul.children.length ? ul : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-rewards', cells });
  element.replaceWith(block);
}
