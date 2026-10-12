/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-casestudy. Base: tabs.
 * Source: https://www.lenovo.com/us/en/ (.len-tabs)
 * Output: one row per case study, 5 cells:
 *   1 label | 2 H3 title + description + <strong> CTA | 3 "The impact" eyebrow + blockquote + author + role
 *   | 4 "How they did it" eyebrow + <ul> of solutions (icon img + text) | 5 stats (H4 value + paragraph label)
 * Inactive panels are hidden in the source (not active tab) but are present in the DOM and read anyway.
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

/** Resolve the SVG URL of a CSS mask-image icon (div.len-icon-image.len-icon__{id}). */
function iconUrl(scope, document) {
  const holder = scope.querySelector('[data-cmp-src]');
  if (holder) return absolute(holder.getAttribute('data-cmp-src'));
  const iconEl = scope.querySelector('.len-icon-image');
  const iconClass = iconEl ? [...iconEl.classList].find((c) => /^len-icon__/.test(c)) : null;
  const styles = [...scope.querySelectorAll('style')];
  if (iconClass) styles.push(...document.querySelectorAll('style'));
  for (const style of styles) {
    const css = style.textContent || '';
    if (iconClass && !css.includes(iconClass)) continue;
    const m = css.match(/mask-image:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i);
    if (m) return absolute(m[1]);
  }
  if (iconEl && typeof window !== 'undefined' && window.getComputedStyle) {
    const cs = window.getComputedStyle(iconEl);
    const val = cs.getPropertyValue('mask-image') || cs.getPropertyValue('-webkit-mask-image') || '';
    const m = val.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
    if (m) return absolute(m[1]);
  }
  return '';
}

function el(document, tag, text) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.len-tabs__tablist > .len-tabs__tab, .len-tabs__tab')]
    .filter((t, i, arr) => arr.indexOf(t) === i);
  const panels = [...element.querySelectorAll('.len-tabs__tabpanel')];

  const cells = [];
  panels.forEach((panel, index) => {
    // Label: matching tab by id (…-tab <-> …-tabpanel), fallback by index
    const tab = (panel.id && tabs.find((t) => t.id && `${t.id}panel` === panel.id)) || tabs[index];
    const labelEl = tab ? tab.querySelector('.len-tabs__tab-title') || tab : null;
    const label = labelEl ? labelEl.textContent.trim() : '';

    // Cell 2: intro
    const intro = [];
    const header = panel.querySelector('.tab-content-header') || panel;
    const title = header.querySelector('.cmp-title__text, h2, h3, h4');
    if (title) intro.push(el(document, 'h3', title.textContent.trim()));
    const desc = header.querySelector('.cmp-title__description');
    if (desc && desc.textContent.trim()) intro.push(el(document, 'p', desc.textContent.trim()));
    [...header.querySelectorAll('.cmp-title__body-wrapper a[href], a.cta[href]')]
      .filter((a, i, arr) => arr.indexOf(a) === i)
      .forEach((a, i) => {
        const p = document.createElement('p');
        const link = el(document, 'a', a.textContent.trim());
        link.href = a.getAttribute('href');
        if (i === 0) {
          const strong = document.createElement('strong');
          strong.append(link);
          p.append(strong);
        } else {
          p.append(link);
        }
        intro.push(p);
      });

    // Cell 3: impact quote
    const impact = [];
    const quoteCard = panel.querySelector('.quote-card');
    if (quoteCard) {
      const eyebrow = quoteCard.querySelector('.quote-card-title');
      if (eyebrow) impact.push(el(document, 'p', eyebrow.textContent.trim()));
      const quote = quoteCard.querySelector('.quote-card-quote');
      if (quote) {
        const bq = document.createElement('blockquote');
        bq.append(el(document, 'p', quote.textContent.trim()));
        impact.push(bq);
      }
      const name = quoteCard.querySelector('.quote-card-author-name');
      if (name) {
        const p = document.createElement('p');
        p.append(el(document, 'strong', name.textContent.trim()));
        impact.push(p);
      }
      const role = quoteCard.querySelector('.quote-card-author-subtext');
      if (role) impact.push(el(document, 'p', role.textContent.trim()));
    }

    // Cell 4: how they did it
    const how = [];
    const listCard = panel.querySelector('.list-card');
    if (listCard) {
      const eyebrow = listCard.querySelector('.list-card-content__eyebrow');
      if (eyebrow) how.push(el(document, 'p', eyebrow.textContent.trim()));
      const ul = document.createElement('ul');
      listCard.querySelectorAll('li').forEach((item) => {
        const text = [...item.childNodes]
          .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && !n.matches('.len-icon, style, svg')))
          .map((n) => n.textContent)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (!text) return;
        const li = document.createElement('li');
        let img = item.querySelector('img');
        if (!img) {
          const src = iconUrl(item, document);
          if (src) {
            img = document.createElement('img');
            // keep a real image: helix-importer converts src ending ".svg" into :icon: tokens
            img.src = /\.svg$/i.test(src) ? `${src}?icon` : src;
            img.alt = '';
          }
        }
        if (img) li.append(img, ' ');
        li.append(text);
        ul.append(li);
      });
      if (ul.children.length) how.push(ul);
    }

    // Cell 5: stats
    const stats = [];
    panel.querySelectorAll('.tab-card--stat, [class*="stat-card"]').forEach((stat, i, arr) => {
      if ([...arr].indexOf(stat) !== i) return;
      const value = stat.querySelector('.len-card__content-title, h5, h4, h3');
      const text = stat.querySelector('.len-card__content-text, p');
      if (value && value.textContent.trim()) stats.push(el(document, 'h4', value.textContent.trim()));
      if (text && text.textContent.trim()) stats.push(el(document, 'p', text.textContent.trim()));
    });

    if (!label && !intro.length) return;
    cells.push([
      label,
      intro.length ? intro : '',
      impact.length ? impact : '',
      how.length ? how : '',
      stats.length ? stats : '',
    ]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-casestudy', cells });
  element.replaceWith(block);
}
