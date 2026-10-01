/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon. Base: cards.
 * Source: https://www.lenovo.com/us/en/ (.card-grid.icon .card-grid__wrapper) — 2 instances
 * Output: one row per item -> [icon image | H3 title + paragraph + text link]
 * Icons are CSS mask-image SVGs (div.len-icon-image.len-icon__{id}); the SVG URL is read from
 * the .cmp-icon[data-cmp-src] attribute, falling back to the inline <style> mask-image rule.
 * Generated: 2026-09-29
 */

function absolute(url) {
  if (!url) return '';
  try {
    return new URL(url, 'https://www.lenovo.com/').href;
  } catch (e) {
    return url;
  }
}

function iconUrl(item, document) {
  const holder = item.querySelector('.len-card__asset .cmp-icon[data-cmp-src], .len-card__asset [data-cmp-src]');
  if (holder) return absolute(holder.getAttribute('data-cmp-src'));

  const iconEl = item.querySelector('.len-card__asset .len-icon-image, .len-icon-image');
  const iconClass = iconEl ? [...iconEl.classList].find((c) => /^len-icon__/.test(c)) : null;

  // Inline <style> inside the item (or anywhere in the document) holding the mask-image rule
  const styles = [...item.querySelectorAll('style')];
  if (iconClass) styles.push(...document.querySelectorAll('style'));
  for (const style of styles) {
    const css = style.textContent || '';
    if (iconClass && !css.includes(iconClass)) continue;
    const m = css.match(/mask-image:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i);
    if (m) return absolute(m[1]);
  }

  // Computed style (live DOM)
  if (iconEl && typeof window !== 'undefined' && window.getComputedStyle) {
    const cs = window.getComputedStyle(iconEl);
    const val = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') || '';
    const m = val.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
    if (m) return absolute(m[1]);
  }
  return '';
}

export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('.len-card-item')];
  if (!items.length) items = [...element.querySelectorAll('.len-card')];

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('.len-card__content-title, h3, h2, h4');
    const textEl = item.querySelector('.len-card__content-text, .len-card__content-text-container p');
    const linkEl = item.querySelector('.len-card__content-cta a[href], a[href]');

    const title = titleEl ? titleEl.textContent.trim() : '';
    const text = textEl ? textEl.textContent.trim() : '';
    if (!title && !text) return;

    // Icon cell: real <img> if present, otherwise build one from the CSS/SVG icon URL
    let icon = item.querySelector('.len-card__asset img');
    if (!icon) {
      const src = iconUrl(item, document);
      if (src) {
        icon = document.createElement('img');
        // helix-importer convertIcons() turns any img whose src ends with ".svg" into an
        // ":icon-name:" token (needs /icons/*.svg in the repo, which this project lacks).
        // A query string keeps it a real image; cards-icon.js matches /\.svg(\?|$)/.
        icon.src = /\.svg$/i.test(src) ? `${src}?icon` : src;
        icon.alt = '';
      }
    }

    const body = [];
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      body.push(p);
    }
    if (linkEl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = linkEl.getAttribute('href');
      a.textContent = linkEl.textContent.trim() || title;
      p.append(a);
      body.push(p);
    }

    cells.push([icon || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
