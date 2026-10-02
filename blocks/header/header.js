/*
 * Header block.
 *
 * Content lives in the nav fragment (nav.plain.html). Each top-level <div> of the
 * fragment is one section, read in this order:
 *   0 topbar    – list of small utility items (link / icon) with optional popovers
 *   1 brand     – logo link
 *   2 search    – search icon link (form action), placeholder, category list, suggestions
 *   3 tools     – list of account / icon links with optional popovers
 *   4 primary   – main navigation; nested list = full-width sub-navigation bar
 *   5 segments  – secondary navigation; nested list = megamenu (link columns + promo cards)
 *   6 promo     – prev/next icons + list of rotating promo messages
 * Everything here is generic: labels, links and images come from the fragment.
 */

const DESKTOP = window.matchMedia('(width >= 1200px)');
const SECTION_ROLES = ['topbar', 'brand', 'search', 'tools', 'primary', 'segments', 'promo'];
const CLOSE_DELAY = 120;
const PROMO_INTERVAL = 5000;

/** The link of a <strong> that holds nothing but one link, else null. */
function boldLinkOf(strong) {
  const [only] = strong.childNodes;
  return strong.childNodes.length === 1 && only.tagName === 'A' ? only : null;
}

/** Turns <strong><a>text</a></strong> into <a><strong>text</strong></a>. */
function unwrapBoldLink(strong, link) {
  strong.replaceWith(link);
  strong.replaceChildren(...link.childNodes);
  link.append(strong);
}

/**
 * Brings published fragment markup back to the shape the decorators expect.
 * The delivery pipeline wraps the content of list items that hold a nested
 * list in a single <p>, wraps images in <picture>, writes fully bold links as
 * <strong><a>, and indents the markup; the local fragment has none of these.
 * Items with several paragraphs (promo cards) keep them. Bold links that are
 * the whole item are left to decoratePopoverContent (they may be a CTA).
 * @param {HTMLElement} fragment
 */
function normalizeFragment(fragment) {
  fragment.querySelectorAll('picture').forEach((picture) => {
    const img = picture.querySelector('img');
    if (img) picture.replaceWith(img);
  });
  fragment.querySelectorAll('li').forEach((li) => {
    const paragraphs = li.querySelectorAll(':scope > p');
    if (paragraphs.length === 1) paragraphs[0].replaceWith(...paragraphs[0].childNodes);
  });
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
  const indents = [];
  while (walker.nextNode()) {
    if (/^\s*\n\s*$/.test(walker.currentNode.textContent)) indents.push(walker.currentNode);
  }
  indents.forEach((n) => n.remove());
  fragment.querySelectorAll('li > strong').forEach((strong) => {
    const link = boldLinkOf(strong);
    if (link && strong.parentElement.childNodes.length > 1) unwrapBoldLink(strong, link);
  });
}

/**
 * Loads the nav fragment. Metadata-independent: under /content when the page
 * itself is (local preview), otherwise from the site root (DA / EDS production).
 * @returns {Promise<HTMLElement|null>}
 */
async function fetchNavFragment() {
  const root = window.location.pathname.startsWith('/content/') ? '/content' : '';
  const resp = await fetch(`${root}/nav.plain.html`);
  if (!resp.ok) return null;
  const fragment = document.createElement('div');
  fragment.innerHTML = await resp.text();
  normalizeFragment(fragment);
  // resolve relative media paths against the fragment location
  fragment.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
    img.loading = 'lazy';
  });
  return fragment;
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.filter(Boolean).forEach((c) => node.append(c));
  return node;
}

/** Text of the direct text nodes of an element (ignores nested lists). */
function ownText(node) {
  return [...node.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits "<a>title<br>description</a>" style content into title/description spans. */
function splitOnBreak(node, prefix) {
  const br = node.querySelector(':scope > br');
  if (!br) return;
  const title = el('span', `${prefix}-title`);
  const desc = el('span', `${prefix}-desc`);
  let target = title;
  [...node.childNodes].forEach((child) => {
    if (child === br) {
      target = desc;
      br.remove();
    } else if (child.nodeName !== 'IMG') {
      target.append(child);
    }
  });
  node.append(title, desc);
}

/* ------------------------------------------------------------------ */
/* open / close state                                                  */
/* ------------------------------------------------------------------ */

function setExpanded(item, expanded) {
  item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const control = item.querySelector(':scope > [aria-expanded]');
  if (control) control.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function closeAll(nav, except) {
  nav.querySelectorAll('.nav-item[aria-expanded="true"]').forEach((item) => {
    if (item !== except) setExpanded(item, false);
  });
}

/** Hover (desktop), focus and Escape handling for any item that owns a panel/popover. */
function bindDisclosure(nav, item) {
  let timer;
  const open = () => {
    clearTimeout(timer);
    closeAll(nav, item);
    setExpanded(item, true);
  };
  const close = () => {
    clearTimeout(timer);
    timer = setTimeout(() => setExpanded(item, false), CLOSE_DELAY);
  };
  item.addEventListener('mouseenter', () => { if (DESKTOP.matches) open(); });
  item.addEventListener('mouseleave', () => { if (DESKTOP.matches) close(); });
  item.addEventListener('focusin', () => { if (DESKTOP.matches) open(); });
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) setExpanded(item, false);
  });
  return { open, close };
}

/* ------------------------------------------------------------------ */
/* popover lists (topbar + tools)                                      */
/* ------------------------------------------------------------------ */

function decoratePopoverContent(list) {
  const popover = el('div', 'nav-popover');
  list.querySelectorAll(':scope > li').forEach((li) => {
    const nested = li.querySelector(':scope > ul');
    const heading = li.querySelector(':scope > strong');
    if (nested && heading) li.classList.add('nav-popover-group');
    const boldLink = heading && !nested && boldLinkOf(heading);
    if (boldLink) {
      // a fully bold link is the call to action only right after the intro;
      // elsewhere it is just a bold link
      if (li.previousElementSibling?.classList.contains('nav-popover-intro')) {
        li.classList.add('nav-popover-cta');
      } else {
        unwrapBoldLink(heading, boldLink);
      }
    }
    if (heading && !nested && !boldLink && !heading.querySelector('a')) {
      li.classList.add('nav-popover-intro');
      splitOnBreak(li, 'nav-popover-intro');
    }
    li.querySelectorAll('a').forEach((a) => {
      if (a.querySelector('img') && a.querySelector('br')) {
        a.classList.add('nav-popover-row');
        splitOnBreak(a, 'nav-popover-row');
      }
    });
    if (!li.querySelector('a') && !heading) li.classList.add('nav-popover-note');
  });
  popover.append(list);
  return popover;
}

function decoratePopoverItem(nav, li) {
  li.classList.add('nav-item');
  const link = li.querySelector(':scope > a');
  const icon = li.querySelector(':scope > img') || link?.querySelector('img');
  const list = li.querySelector(':scope > ul');
  const label = ownText(li) || icon?.alt || link?.textContent.trim() || '';

  if (icon) {
    li.classList.add('nav-item-icon');
    icon.classList.add('nav-icon');
    icon.width = 24;
    icon.height = 24;
  }
  if (link && icon && !link.textContent.trim()) {
    link.setAttribute('aria-label', icon.alt);
    icon.alt = '';
  }

  // items without a link become buttons (icon-only or icon + visible text)
  if (!link) {
    const button = el('button', 'nav-item-button');
    button.type = 'button';
    if (icon) button.append(icon);
    const text = ownText(li);
    [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => n.remove());
    if (text) {
      button.append(el('span', 'nav-item-label', text));
    } else {
      button.setAttribute('aria-label', label);
      if (icon) icon.alt = '';
      li.classList.add('nav-item-tooltip');
      li.dataset.tooltip = label;
    }
    li.prepend(button);
    if (list) {
      button.setAttribute('aria-haspopup', 'true');
      button.setAttribute('aria-expanded', 'false');
      button.classList.add('nav-item-caret');
      if (text) button.classList.add('nav-item-caret-visible');
    }
  }

  if (!list) return;
  const popover = decoratePopoverContent(list);
  li.append(popover);
  li.classList.add('nav-item-popover');
  setExpanded(li, false);

  // a text link with a popover gets a separate click-toggle caret (link keeps navigating)
  if (link && !icon) {
    const toggle = el('button', 'nav-item-button nav-item-caret nav-item-caret-visible');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', `Expand ${link.textContent.trim()}`);
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    link.after(toggle);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = li.getAttribute('aria-expanded') === 'true';
      closeAll(nav, li);
      setExpanded(li, !expanded);
    });
    return;
  }
  bindDisclosure(nav, li);
  const button = li.querySelector(':scope > button');
  if (button) {
    button.addEventListener('click', () => {
      const expanded = li.getAttribute('aria-expanded') === 'true';
      closeAll(nav, li);
      setExpanded(li, !expanded);
    });
  }
}

function buildPopoverList(nav, section, className) {
  const list = section.querySelector('ul');
  if (!list) return null;
  list.classList.add(className);
  [...list.children].forEach((li) => decoratePopoverItem(nav, li));
  return list;
}

/* ------------------------------------------------------------------ */
/* brand + search                                                      */
/* ------------------------------------------------------------------ */

function buildBrand(section) {
  const brand = el('div', 'nav-brand');
  const link = section.querySelector('a');
  if (link) {
    const img = link.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.width = 124;
      img.height = 40;
    }
    brand.append(link);
  }
  return brand;
}

function buildSearch(nav, section) {
  const wrap = el('div', 'nav-search');
  if (!section) return wrap;
  const actionLink = section.querySelector('a');
  const imgs = [...section.querySelectorAll('img')];
  const searchIcon = imgs[0];
  const caretIcon = imgs[1];
  const placeholder = [...section.querySelectorAll(':scope > p')]
    .find((p) => !p.querySelector('img, strong'))?.textContent.trim() || '';
  const [categoryList, suggestionList] = section.querySelectorAll(':scope > ul');
  const suggestionTitle = section.querySelector(':scope > p > strong')?.textContent.trim() || '';

  const form = el('form', 'nav-search-form');
  form.action = actionLink ? actionLink.href : '';
  form.method = 'get';
  form.setAttribute('role', 'search');

  // category selector
  const categories = categoryList
    ? [...categoryList.children].map((li) => li.textContent.trim())
    : [];
  const category = el('div', 'nav-search-category');
  const categoryButton = el('button', 'nav-search-category-button');
  categoryButton.type = 'button';
  categoryButton.setAttribute('aria-haspopup', 'listbox');
  categoryButton.setAttribute('aria-expanded', 'false');
  categoryButton.setAttribute('aria-label', 'Category');
  const categoryValue = el('span', 'nav-search-category-value', categories[0] || '');
  categoryButton.append(categoryValue);
  if (caretIcon) {
    caretIcon.alt = '';
    caretIcon.classList.add('nav-search-caret');
    categoryButton.append(caretIcon);
  }
  const categoryOptions = el('ul', 'nav-search-categories');
  categoryOptions.setAttribute('role', 'listbox');
  const hidden = el('input');
  hidden.type = 'hidden';
  hidden.name = 'category';
  hidden.value = categories[0] || '';
  categories.forEach((name, i) => {
    const option = el('li', 'nav-search-option', name);
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    option.tabIndex = -1;
    option.addEventListener('click', () => {
      categoryOptions.querySelectorAll('[aria-selected]')
        .forEach((o) => o.setAttribute('aria-selected', 'false'));
      option.setAttribute('aria-selected', 'true');
      categoryValue.textContent = name;
      hidden.value = name;
      categoryButton.setAttribute('aria-expanded', 'false');
    });
    categoryOptions.append(option);
  });
  categoryButton.addEventListener('click', () => {
    const expanded = categoryButton.getAttribute('aria-expanded') === 'true';
    categoryButton.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  category.append(categoryButton, categoryOptions);

  // input + submit
  const input = el('input', 'nav-search-input');
  input.type = 'search';
  input.name = 'text';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder || 'Search');
  input.autocomplete = 'off';
  const submit = el('button', 'nav-search-submit');
  submit.type = 'submit';
  submit.setAttribute('aria-label', searchIcon?.alt || 'Search');
  if (searchIcon) {
    searchIcon.alt = '';
    submit.append(searchIcon);
  }

  // suggestions
  const suggestions = el('div', 'nav-search-suggestions');
  if (suggestionList) {
    if (suggestionTitle) suggestions.append(el('p', 'nav-search-suggestions-title', suggestionTitle));
    const list = el('ul');
    [...suggestionList.children].forEach((li) => {
      const term = li.textContent.trim();
      const item = el('li');
      const btn = el('button', 'nav-search-suggestion', term);
      btn.type = 'button';
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = term;
        form.requestSubmit();
      });
      item.append(btn);
      list.append(item);
    });
    suggestions.append(list);
  }
  input.addEventListener('focus', () => form.classList.add('is-focused'));
  input.addEventListener('blur', () => form.classList.remove('is-focused'));

  form.append(category, hidden, input, submit, suggestions);
  document.addEventListener('click', (e) => {
    if (!category.contains(e.target)) categoryButton.setAttribute('aria-expanded', 'false');
  });
  wrap.append(form);
  return wrap;
}

/* ------------------------------------------------------------------ */
/* navigation rows                                                     */
/* ------------------------------------------------------------------ */

function decorateBarPanel(list) {
  const panel = el('div', 'nav-panel nav-panel-bar');
  list.classList.add('nav-panel-links');
  list.querySelectorAll(':scope > li').forEach((li) => li.classList.add('nav-panel-link'));
  panel.append(list);
  return panel;
}

function decorateCard(li) {
  const link = li.querySelector('a');
  const img = li.querySelector('img');
  const texts = [...li.querySelectorAll(':scope > p')].filter((p) => !p.querySelector('img'));
  const card = el('a', 'nav-card');
  card.href = link ? link.href : '#';
  if (img) {
    img.alt = '';
    card.append(el('span', 'nav-card-image', img));
  }
  const caption = el('span', 'nav-card-caption');
  texts.forEach((p, i) => caption.append(el('span', i === 0 ? 'nav-card-title' : 'nav-card-text', p.textContent.trim())));
  card.append(caption);
  li.replaceChildren(card);
  li.className = 'nav-card-item';
  return li;
}

function decorateMegaPanel(list) {
  const panel = el('div', 'nav-panel nav-panel-mega');
  const columns = el('div', 'nav-panel-columns');
  const cards = el('ul', 'nav-panel-cards');
  [...list.children].forEach((li) => {
    if (li.querySelector('img')) {
      cards.append(decorateCard(li));
      return;
    }
    const column = el('div', 'nav-panel-column');
    const heading = li.querySelector(':scope > a, :scope > strong');
    if (heading) {
      heading.classList.add('nav-column-heading');
      column.append(heading);
    }
    const links = li.querySelector(':scope > ul');
    if (links) {
      links.classList.add('nav-column-links');
      links.querySelectorAll(':scope > li').forEach((item) => {
        if (!item.querySelector('a') && item.querySelector('strong')) item.classList.add('nav-column-subheading');
      });
      column.append(links);
    }
    columns.append(column);
  });
  panel.append(columns);
  if (cards.children.length) panel.append(cards);
  return panel;
}

function buildNavList(nav, section, className, decoratePanel) {
  const list = section?.querySelector('ul');
  if (!list) return null;
  list.classList.add(className);
  [...list.children].forEach((li) => {
    li.classList.add('nav-item', 'nav-trigger');
    const link = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > ul');
    if (!link || !sub) return;
    link.setAttribute('aria-haspopup', 'true');
    li.append(decoratePanel(sub));
    setExpanded(li, false);
    link.setAttribute('aria-expanded', 'false');
    bindDisclosure(nav, li);
  });
  return list;
}

/* ------------------------------------------------------------------ */
/* promo strip                                                         */
/* ------------------------------------------------------------------ */

function buildPromo(section) {
  const promo = el('div', 'nav-promo');
  const list = section?.querySelector('ul');
  if (!list) return promo;
  promo.setAttribute('role', 'region');
  promo.setAttribute('aria-roledescription', 'carousel');
  promo.setAttribute('aria-label', 'Promotions');
  const [prevIcon, nextIcon] = section.querySelectorAll('img');
  const makeButton = (icon, cls, fallback) => {
    const btn = el('button', `nav-promo-button ${cls}`);
    btn.type = 'button';
    btn.setAttribute('aria-label', icon?.alt || fallback);
    if (icon) {
      icon.alt = '';
      icon.width = 16;
      icon.height = 16;
      btn.append(icon);
    }
    return btn;
  };
  const prev = makeButton(prevIcon, 'nav-promo-prev', 'Previous');
  const next = makeButton(nextIcon, 'nav-promo-next', 'Next');
  list.classList.add('nav-promo-track');
  const slides = [...list.children];
  slides.forEach((li, i) => {
    li.classList.add('nav-promo-slide');
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
  });
  const viewport = el('div', 'nav-promo-viewport', list);
  let index = 0;
  let timer;
  const show = (i) => {
    index = (i + slides.length) % slides.length;
    list.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => {
      s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
      s.querySelectorAll('a').forEach((a) => { a.tabIndex = n === index ? 0 : -1; });
    });
  };
  const start = () => {
    clearInterval(timer);
    if (slides.length > 1) timer = setInterval(() => show(index + 1), PROMO_INTERVAL);
  };
  prev.addEventListener('click', () => { show(index - 1); start(); });
  next.addEventListener('click', () => { show(index + 1); start(); });
  promo.addEventListener('mouseenter', () => clearInterval(timer));
  promo.addEventListener('mouseleave', start);
  promo.addEventListener('focusin', () => clearInterval(timer));
  show(0);
  start();
  promo.append(el('div', 'nav-promo-inner', prev, viewport, next));
  return promo;
}

/* ------------------------------------------------------------------ */
/* decorate                                                            */
/* ------------------------------------------------------------------ */

function toggleMobileMenu(nav, force) {
  const expanded = force !== undefined ? !force : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const button = nav.querySelector('.nav-hamburger button');
  if (button) {
    button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  document.body.style.overflowY = (!expanded && !DESKTOP.matches) ? 'hidden' : '';
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const sections = {};
  [...fragment.children].forEach((section, i) => {
    if (SECTION_ROLES[i]) sections[SECTION_ROLES[i]] = section;
  });

  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.setAttribute('aria-expanded', 'false');

  const topbar = el('div', 'nav-topbar');
  const topbarList = sections.topbar && buildPopoverList(nav, sections.topbar, 'nav-topbar-list');
  if (topbarList) topbar.append(topbarList);

  const hamburger = el('div', 'nav-hamburger');
  const hamburgerButton = el('button', '', el('span', 'nav-hamburger-icon'));
  hamburgerButton.type = 'button';
  hamburgerButton.setAttribute('aria-controls', 'nav');
  hamburgerButton.setAttribute('aria-expanded', 'false');
  hamburgerButton.setAttribute('aria-label', 'Open navigation');
  hamburgerButton.addEventListener('click', () => toggleMobileMenu(nav));
  hamburger.append(hamburgerButton);

  const masthead = el('div', 'nav-masthead');
  const tools = el('div', 'nav-tools');
  const toolsList = sections.tools && buildPopoverList(nav, sections.tools, 'nav-tools-list');
  if (toolsList) tools.append(toolsList);
  masthead.append(
    hamburger,
    sections.brand ? buildBrand(sections.brand) : null,
    buildSearch(nav, sections.search),
    tools,
  );

  const row = el('div', 'nav-row');
  const primary = el('div', 'nav-primary');
  const primaryList = buildNavList(nav, sections.primary, 'nav-primary-list', decorateBarPanel);
  if (primaryList) primary.append(primaryList);
  const segments = el('div', 'nav-segments');
  const segmentList = buildNavList(nav, sections.segments, 'nav-segments-list', decorateMegaPanel);
  if (segmentList) segments.append(segmentList);
  row.append(primary, segments);

  nav.append(topbar, masthead, row, buildPromo(sections.promo));

  // global close behaviour
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-item[aria-expanded="true"]');
    closeAll(nav);
    open?.querySelector('a, button')?.focus();
    if (!DESKTOP.matches && nav.getAttribute('aria-expanded') === 'true') toggleMobileMenu(nav, false);
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAll(nav);
  });
  DESKTOP.addEventListener('change', () => {
    closeAll(nav);
    toggleMobileMenu(nav, false);
  });

  const wrapper = el('div', 'nav-wrapper', nav);
  block.append(wrapper);
}
