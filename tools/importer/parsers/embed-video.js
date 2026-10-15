/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (.dx-thinkpad-yt-video-facade) — 1 instance
 * Output (1 column, 1 row): poster image above a YouTube watch link.
 *
 * Source: div.dx-thinkpad-yt-video-facade > input[aria-label="Play video"]
 *   + iframe[src="https://www.youtube-nocookie.com/embed/LX3PWr9UJDI?autoplay=1&mute=1&controls=0"]
 *   + img (poster, alt "Video thumbnail") + div.dx-thinkpad-yt-video-play (icon).
 * The video id is read from the facade itself (iframe src / data-src, or data-* attributes);
 * it is never invented: without an id the element is left as-is (no block).
 * The poster's generic alt "Video thumbnail" is dropped (decorative).
 * Generated: 2026-10-15 (laptops template)
 */
const YT_ID_RE = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i;

function videoIdFrom(element) {
  const candidates = [];
  element.querySelectorAll('iframe').forEach((f) => {
    candidates.push(f.getAttribute('src'), f.getAttribute('data-src'));
  });
  [element, ...element.querySelectorAll('*')].forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (/^data-/.test(attr.name)) candidates.push(attr.value);
    });
  });
  element.querySelectorAll('a[href]').forEach((a) => candidates.push(a.getAttribute('href')));
  for (const c of candidates) {
    const m = (c || '').match(YT_ID_RE);
    if (m) return m[1];
  }
  // bare id attributes (data-video-id / data-videoid / data-yt-id)
  const idEl = element.querySelector('[data-video-id], [data-videoid], [data-yt-id]')
    || (element.matches('[data-video-id], [data-videoid], [data-yt-id]') ? element : null);
  if (idEl) {
    const id = idEl.getAttribute('data-video-id') || idEl.getAttribute('data-videoid') || idEl.getAttribute('data-yt-id');
    if (/^[\w-]{6,}$/.test(id || '')) return id;
  }
  return '';
}

export default function parse(element, { document }) {
  const id = videoIdFrom(element);
  if (!id) {
    // No video id in the markup: leave the content untouched rather than invent one.
    return;
  }

  const poster = element.querySelector(':scope > img, :scope > picture img')
    || [...element.querySelectorAll('img')].find((i) => !i.closest('.dx-thinkpad-yt-video-play'));
  if (poster && /^video thumbnail$/i.test((poster.getAttribute('alt') || '').trim())) {
    poster.setAttribute('alt', '');
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const link = document.createElement('a');
  link.href = url;
  link.textContent = url;

  // poster and link in separate paragraphs (image above the link)
  const content = [];
  if (poster) {
    const p = document.createElement('p');
    p.append(poster);
    content.push(p);
  }
  const linkP = document.createElement('p');
  linkP.append(link);
  content.push(linkP);

  const cells = [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
