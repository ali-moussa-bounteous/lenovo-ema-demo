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
    if (!entry) {
      list.scrollTo({ left: 0 });
      return;
    }
    entry.link.setAttribute('aria-current', 'true');
    revealInList(list, entry.link);
  };

  // jump targets (clicks and hash loads alike) land below the pinned bar
  const setScrollMargins = () => {
    const offset = `${Math.ceil(block.getBoundingClientRect().height) + 8}px`;
    entries.forEach(({ target }) => { target.style.scrollMarginTop = offset; });
  };
  setScrollMargins();
  entries.forEach(({ link }) => link.addEventListener('click', setScrollMargins));

  // scroll spy: the current entry is the last target (in document order) whose
  // top has scrolled above a line just under the pinned bar. Reading positions
  // on scroll (once per frame) also stays correct after large jumps, e.g. a
  // scroll back to the top, which an IntersectionObserver band can miss.
  let current;
  let ticking = false;
  let measured = false;
  const update = () => {
    ticking = false;
    // the section is hidden while it loads: measure the bar once it has a size
    if (!measured && block.offsetHeight) {
      measured = true;
      setScrollMargins();
    }
    const bar = block.getBoundingClientRect();
    const line = bar.bottom + Math.min(window.innerHeight * 0.25, 200);
    // nothing is "current" until the bar has reached the top and pinned
    const next = bar.top > 1 ? undefined : [...entries].reverse()
      .find(({ target }) => target.getBoundingClientRect().top <= line);
    if (next === current) return;
    current = next;
    setCurrent(next);
  };
  const schedule = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => { setScrollMargins(); schedule(); }, { passive: true });
  update();
  // first paint of the section (it is revealed after decoration)
  window.requestAnimationFrame(schedule);
}
