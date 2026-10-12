/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-prompt. Base: tabs.
 * Source: https://www.lenovo.com/us/en/ (.len-prompt-container)
 * Output:
 *   - single-cell intro row: panel background image (image-only paragraph) + H2 heading
 *   - one row per prompt: [label | results authored sequentially]
 *     results = feature image, H3 feature caption, then per result item: H3 (linked title), paragraph.
 *     Each image starts a new result card; each extra H3 starts another card (block groupResults()).
 * Result panels are hidden in the source until a prompt is clicked; they are read from the DOM anyway.
 * Generated: 2026-09-29
 */

/** Resolve a usable src for lazy images (src may be missing until loaded). */
function resolveImage(img, document) {
  if (!img) return null;
  let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  if (!src || src.startsWith('data:')) {
    const picture = img.closest('picture');
    const candidates = [
      img.getAttribute('data-srcset'),
      img.getAttribute('srcset'),
      ...(picture ? [...picture.querySelectorAll('source')].flatMap((s) => [s.getAttribute('data-srcset'), s.getAttribute('srcset')]) : []),
    ].filter(Boolean);
    if (candidates.length) src = candidates[candidates.length - 1].split(',')[0].trim().split(/\s+/)[0];
  }
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = (img.getAttribute('alt') || '').trim();
  return out;
}

function imageParagraph(img, document) {
  const p = document.createElement('p');
  p.append(img);
  return p;
}

/** Key shared between a prompt button wrapper and its result container (e.g. _content_..._master). */
function keyOf(el) {
  if (!el) return '';
  const cls = [...el.classList].find((c) => c.startsWith('_content_')) || '';
  return normalizeKey(cls);
}

/** Normalise a _content_..._master class or an XF path to a comparable key. */
function normalizeKey(value) {
  if (!value) return '';
  const v = value.replace(/^https?:\/\/[^/]+/, '');
  return v.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Results live in experience fragments that the live page only loads on click
 * (div.len-prompt-xf-path[data-xf-path] is empty until then). When the result markup is
 * not in the DOM, fetch the fragment synchronously and parse it.
 */
function loadFragment(xfPath, document) {
  if (!xfPath || typeof XMLHttpRequest === 'undefined' || typeof DOMParser === 'undefined') return null;
  const url = /\.html$/.test(xfPath) ? xfPath : `${xfPath}.html`;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    if (xhr.status !== 200) return null;
    const doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
    return { root: doc.querySelector('.len-prompt-container__results-content--media-container') || doc.body, base: url };
  } catch (e) {
    return null;
  }
}

function absolute(href, base) {
  if (!href) return href;
  try {
    return new URL(href, base || 'https://www.lenovo.com/').href;
  } catch (e) {
    return href;
  }
}

export default function parse(element, { document }) {
  const cells = [];

  // Intro: background image + heading
  const intro = [];
  const bgImg = resolveImage(
    element.querySelector('.len-prompt-container__bg-image--main > .picture-tag img, .len-prompt-container__bg-image img'),
    document,
  );
  if (bgImg) intro.push(imageParagraph(bgImg, document));
  const heading = element.querySelector('.len-prompt-container__actions-group-list-heading')
    || element.querySelector('.len-prompt-container__actions h2, .len-prompt-container__actions h3');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    intro.push(h2);
  }
  if (intro.length) cells.push([intro]);

  // Result sets, one per .len-prompt-xf-path, keyed so they can be matched to prompt labels.
  // Pre-rendered (clicked) DOM: media container is present. Live DOM: fetch the fragment.
  const resultSets = [];
  const xfPaths = [...element.querySelectorAll('.len-prompt-xf-path')];
  xfPaths.forEach((xf) => {
    const inline = xf.querySelector('.len-prompt-container__results-content--media-container');
    if (inline) {
      resultSets.push({ root: inline, base: '', key: keyOf(inline) });
      return;
    }
    const path = xf.getAttribute('data-xf-path');
    const loaded = loadFragment(path, document);
    if (loaded) resultSets.push({ ...loaded, key: normalizeKey(path) });
  });
  if (!xfPaths.length) {
    element.querySelectorAll('.len-prompt-container__results-content--media-container')
      .forEach((r) => resultSets.push({ root: r, base: '', key: keyOf(r) }));
  }
  const resultsByKey = new Map(resultSets.map((r) => [r.key, r]));

  // Prompt labels: unique list in the results header (one button per prompt, carries the key)
  let prompts = [...element.querySelectorAll('.len-prompt-container__results-content-actions-prompts > .cta-button__wrap')]
    .map((wrap) => ({ label: wrap.textContent.trim(), key: keyOf(wrap) }));
  if (!prompts.length) {
    // Fallback: desktop pill buttons in the action list (desktop + mobile duplicates -> dedupe)
    const seen = new Set();
    prompts = [...element.querySelectorAll('.len-prompt-container__actions-group-list-btn button')]
      .map((b) => b.textContent.trim())
      .filter((t) => t && !seen.has(t) && seen.add(t))
      .map((label) => ({ label, key: '' }));
  }

  prompts.forEach((prompt, index) => {
    if (!prompt.label) return;
    const set = (prompt.key && resultsByKey.get(prompt.key)) || resultSets[index];
    const result = set ? set.root : null;
    const base = set ? set.base : '';
    const content = [];

    if (result) {
      // Feature card: image + caption
      const media = result.querySelector('.len-prompt-container__results-content--media');
      const img = resolveImage(media ? media.querySelector('img') : null, document);
      if (img) {
        if (base) img.src = absolute(img.getAttribute('src'), base);
        content.push(imageParagraph(img, document));
      }
      const caption = result.querySelector('.len-prompt-container__results-description-container.desktop-only .len-prompt-container__results-content--description')
        || result.querySelector('.len-prompt-container__results-content--description');
      if (caption && caption.textContent.trim()) {
        const h3 = document.createElement('h3');
        h3.textContent = caption.textContent.trim();
        content.push(h3);
      }

      // Result items: linked title + description
      result.querySelectorAll('.prompt-item').forEach((item) => {
        const titleEl = item.querySelector('.prompt-item-content--title, h5, h4, h3');
        const descEl = item.querySelector('.prompt-item-content--description, p');
        const linkEl = item.querySelector('a.prompt-item-action-container[href], a[href]');
        const title = titleEl ? titleEl.textContent.trim() : '';
        if (!title) return;
        const h3 = document.createElement('h3');
        if (linkEl) {
          const a = document.createElement('a');
          a.href = base ? absolute(linkEl.getAttribute('href'), base) : linkEl.getAttribute('href');
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        content.push(h3);
        if (descEl && descEl.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = descEl.textContent.trim();
          content.push(p);
        }
      });
    }

    cells.push([prompt.label, content.length ? content : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-prompt', cells });
  element.replaceWith(block);
}
