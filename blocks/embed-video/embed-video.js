import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function optimize(img, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', false, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/**
 * Resolves a video page URL to an embeddable player URL.
 * @param {string} href
 * @returns {{ provider: string, src: string } | null}
 */
function toEmbed(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  let id = '';
  if (host === 'youtu.be') [, id] = url.pathname.split('/');
  else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    id = url.searchParams.get('v') || '';
    const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
    if (!id && m) [, id] = m;
  }
  if (id) {
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
    const start = url.searchParams.get('t') || url.searchParams.get('start');
    if (start) params.set('start', String(parseInt(start, 10) || 0));
    return { provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}` };
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const vid = url.pathname.split('/').filter(Boolean).find((s) => /^\d+$/.test(s));
    if (vid) return { provider: 'vimeo', src: `https://player.vimeo.com/video/${vid}?autoplay=1` };
  }
  return null;
}

/** Link text that is just the URL is not a usable title. */
function linkTitle(a) {
  const text = a.textContent.trim();
  if (!text || /^https?:\/\//i.test(text)) return '';
  return text;
}

/**
 * Text of the closest heading authored before the block in its section (the
 * video's visible context), used when the block itself carries no title.
 */
function precedingHeading(block) {
  const section = block.closest('.section');
  if (!section) return '';
  const headings = [...section.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .filter((h) => !block.contains(h)
      // eslint-disable-next-line no-bitwise
      && (h.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING));
  const h = headings[headings.length - 1];
  return h ? h.textContent.trim() : '';
}

/**
 * Embed (video): a lightweight facade - poster image plus a play button. The
 * player iframe is only created when the visitor presses play, so no third
 * party script or frame loads with the page.
 * Content: poster image and a video link (YouTube / Vimeo), in any cells.
 * Optional plain text (or the link text) becomes the player title.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const link = [...block.querySelectorAll('a[href]')].find((a) => toEmbed(a.href));
  if (!link) return; // nothing embeddable: leave the authored content as is
  const embed = toEmbed(link.href);

  const img = block.querySelector('img');
  const textTitle = [...block.querySelectorAll('p, h1, h2, h3, h4, h5, h6')]
    .find((el) => !el.querySelector('a, img') && el.textContent.trim());
  const title = linkTitle(link) || (textTitle && textTitle.textContent.trim())
    || (img && img.alt) || precedingHeading(block) || 'Video';

  const facade = document.createElement('div');
  facade.className = 'embed-video-facade';
  if (img) {
    const poster = document.createElement('div');
    poster.className = 'embed-video-poster';
    poster.append(optimize(img, [{ media: '(width >= 900px)', width: '1600' }, { width: '900' }]));
    facade.append(poster);
  } else {
    block.classList.add('embed-video-no-poster');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'embed-video-play';
  button.setAttribute('aria-label', `Play video: ${title}`);
  button.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  facade.append(button);

  const load = () => {
    const iframe = document.createElement('iframe');
    iframe.src = embed.src;
    iframe.title = title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const player = document.createElement('div');
    player.className = 'embed-video-player';
    player.append(iframe);
    facade.replaceWith(player);
    block.classList.add('embed-video-is-playing');
    iframe.focus();
  };
  button.addEventListener('click', load, { once: true });
  // warm up the connection once the visitor shows intent
  facade.addEventListener('pointerenter', () => {
    const { origin } = new URL(embed.src);
    if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
    const hint = document.createElement('link');
    hint.rel = 'preconnect';
    hint.href = origin;
    document.head.append(hint);
  }, { once: true });

  block.replaceChildren(facade);
}
