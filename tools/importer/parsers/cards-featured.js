/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-featured. Base: cards.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/
 *   (.layouts_special_content_3columns:has(.small_content)) — 2 instances:
 *   #1 section 4 "Featured ThinkPads" (3 cards), #2 section 7 services (4 cards)
 * Output (2 columns, one row per card):
 *   [ photo | logo image (only when it has a src), H3 title, description (paragraphs or bullet list),
 *     CTA link (first link only) ]
 *
 * Iteration is keyed on the block-level div.small_content wrappers.
 * Photo: img.background-image-container (first card, text-over-photo) or
 *        .small_content_container_media img. Generic alt "small_content_card_image" is cleared.
 * Title: .small_content_container_text_title (h3 > span), description:
 *        .small_content_container_text_desc (ul, p > span, or bare text; source line breaks
 *        inside spans are collapsed to spaces).
 * CTA: .small_content_container-cta-btn a (the a.small_content_container-cta-link responsive
 *      duplicate is removed by the cleanup transformer and ignored here).
 * Logo slots (img.small_content_container_text_logo) are empty on this page (no src) and dropped.
 * Generated: 2026-10-15 (laptops template)
 */
const GENERIC_ALT = /^(small_content_card_image|image|img|photo)$/i;

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function cleanHtml(html) {
  return (html || '').replace(/\s+/g, ' ').replace(/(<br\s*\/?>\s*)+$/i, '').trim();
}

function buildDescription(desc, document) {
  const out = [];
  if (!desc) return out;
  const lists = [...desc.querySelectorAll('ul, ol')];
  if (lists.length) {
    lists.forEach((list) => {
      const l = document.createElement(list.tagName.toLowerCase());
      list.querySelectorAll(':scope > li').forEach((li) => {
        if (!clean(li.textContent)) return;
        const item = document.createElement('li');
        item.innerHTML = cleanHtml(li.innerHTML);
        l.append(item);
      });
      if (l.children.length) out.push(l);
    });
  }
  const paras = [...desc.querySelectorAll('p')].filter((p) => clean(p.textContent) && !p.closest('li'));
  paras.forEach((p) => {
    const np = document.createElement('p');
    np.innerHTML = cleanHtml(p.innerHTML);
    out.push(np);
  });
  if (!out.length && clean(desc.textContent)) {
    const np = document.createElement('p');
    np.innerHTML = cleanHtml(desc.innerHTML);
    out.push(np);
  }
  return out;
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.small_content')];

  const cells = [];
  cards.forEach((card) => {
    const photo = card.querySelector('img.background-image-container')
      || card.querySelector('.small_content_container_media img')
      || card.querySelector('img:not(.small_content_container_text_logo)');
    const logo = [...card.querySelectorAll('img.small_content_container_text_logo')]
      .find((img) => img.getAttribute('src'));
    const titleEl = card.querySelector('.small_content_container_text_title');
    const title = clean(titleEl && titleEl.textContent);
    const desc = card.querySelector('.small_content_container_text_desc');
    const cta = card.querySelector('.small_content_container-cta-btn a[href]')
      || card.querySelector('.small_content_container--cta a[href]');

    if (!title && !photo) return;

    const body = [];
    if (logo) {
      const p = document.createElement('p');
      p.append(logo);
      body.push(p);
    }
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    body.push(...buildDescription(desc, document));
    if (cta && clean(cta.textContent)) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = clean(cta.textContent);
      const p = document.createElement('p');
      p.append(a);
      body.push(p);
    }

    if (photo && GENERIC_ALT.test(clean(photo.getAttribute('alt')))) photo.setAttribute('alt', '');
    cells.push([photo || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-featured', cells });
  element.replaceWith(block);
}
