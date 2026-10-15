const OPTION_CLASSES = [];

const DEFAULT_LABEL = 'On this page';

/** Returns the in-page target id for a link, or '' when it points elsewhere. */
function targetId(a) {
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#')) return decodeURIComponent(href.slice(1));
  try {
    const url = new URL(a.href, window.location.href);
    if (url.origin === window.location.origin && url.pathname === window.location.pathname) {
      return decodeURIComponent(url.hash.slice(1));
    }
  } catch { /* not a URL */ }
  return '';
}

/** Keeps the active link visible inside the horizontally scrolling list. */
function revealInList(list, link) {
  const li = link.parentElement;
  const left = li.offsetLeft;
  const right = left + li.offsetWidth;
  if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
    list.scrollTo({ left: Math.max(0, left - 16) });
  }
}

/**
 * Anchor nav (sticky): in-page jump links that stay pinned to the top of the
 * viewport and mark the section currently in view with aria-current.
 * Content: one link per row (or any number of links in any cell), each
 * pointing at an in-page id (#section-heading-id). An optional plain-text
 * cell becomes the nav's accessible label. Links whose target is missing on
 * the page are dropped.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const labelCell = [...block.querySelectorAll(':scope > div > div')]
    .find((cell) => !cell.querySelector('a') && cell.textContent.trim());
  const label = labelCell ? labelCell.textContent.trim() : DEFAULT_LABEL;

  const entries = [];
  const seen = new Set();
  block.querySelectorAll('a[href]').forEach((a) => {
    const id = targetId(a);
    if (!id || seen.has(id)) return;
    const target = document.getElementById(id);
    if (!target) return; // skip links whose section is not on the page
    seen.add(id);
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = a.textContent.trim();
    entries.push({ link, target });
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', label);
  const list = document.createElement('ul');
  list.className = 'anchor-nav-sticky-list';
  entries.forEach(({ link }) => {
    const li = document.createElement('li');
    li.append(link);
    list.append(li);
  });
  nav.append(list);
  block.replaceChildren(nav);

  if (!entries.length) {
    block.classList.add('anchor-nav-sticky-empty');
    return;
  }

  const setCurrent = (entry) => {
    entries.forEach(({ link }) => link.removeAttribute('aria-current'));
    if (!entry) return;
    entry.link.setAttribute('aria-current', 'true');
    revealInList(list, entry.link);
  };

  // jump targets land below the pinned bar
  entries.forEach(({ link, target }) => {
    link.addEventListener('click', () => {
      target.style.scrollMarginTop = `${block.getBoundingClientRect().height + 8}px`;
    });
  });

  // scroll spy: an observer band covers the top 30% of the viewport; every
  // time a target crosses its lower edge we record whether the target has
  // reached it. The last reached target (in document order) is current, so
  // several anchors inside one section each get their turn.
  const reached = new Map();
  const observer = new IntersectionObserver((records) => {
    records.forEach((r) => {
      const line = r.rootBounds ? r.rootBounds.bottom : window.innerHeight * 0.3;
      reached.set(r.target, r.boundingClientRect.top < line);
    });
    setCurrent([...entries].reverse().find(({ target }) => reached.get(target)));
  }, { rootMargin: '0px 0px -70% 0px' });
  entries.forEach(({ target }) => observer.observe(target));
}
