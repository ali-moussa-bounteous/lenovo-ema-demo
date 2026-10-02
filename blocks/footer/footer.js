/*
 * Footer block — content-first.
 *
 * All copy, links and images come from the footer fragment
 * (/content/footer.plain.html for local /content pages, /footer.plain.html on DA/EDS).
 * The fragment is a flat list of sections; each section is classified by
 * its content signature and rendered into a generic footer region:
 *
 *  - heading(s) + lists ............ link columns
 *  - list of image-only links ...... social icons
 *  - image-only links (no list) .... app badges
 *  - list of links with images ..... locale (country / region) selector
 *  - list of plain items (no links)  newsletter (intro, action link, messages)
 *  - anything else ................. legal bar (copyright + links)
 */

const MOBILE_CLONE_CLASS = 'footer-social-mobile';

/**
 * Fetches the footer fragment (metadata-independent) and returns
 * its top-level section elements. The fragment is parsed in an inert document
 * so images (e.g. locale flags) are only requested once they are rendered.
 * @returns {Promise<Element[]>}
 */
async function fetchFooterSections() {
  // metadata-independent: /content when the page is there (localhost), else root (DA/EDS prod)
  const root = window.location.pathname.startsWith('/content/') ? '/content' : '';
  const resp = await fetch(`${root}/footer.plain.html`);
  if (!resp.ok) return [];
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', new URL(img.getAttribute('src'), resp.url).href);
  });
  return [...doc.body.children].filter((el) => el.tagName === 'DIV');
}

const isImageOnlyLink = (a) => !!a.querySelector('img') && !a.textContent.trim();
const isTextOnlyParagraph = (p) => p.tagName === 'P' && !p.querySelector('a');
const isLinkOnlyParagraph = (p) => {
  const links = p.querySelectorAll('a');
  return p.tagName === 'P' && links.length === 1
    && p.textContent.trim() === links[0].textContent.trim();
};

/**
 * Determines the role of a fragment section from its content.
 * @param {Element} section
 * @returns {string}
 */
function classifySection(section) {
  if (section.querySelector('h1, h2, h3, h4, h5, h6')) return 'links';
  const links = [...section.querySelectorAll('a')];
  if (links.length && links.every(isImageOnlyLink)) {
    return section.querySelector('ul') ? 'social' : 'apps';
  }
  if (links.some((a) => a.querySelector('img') && a.textContent.trim())) return 'locale';
  if ([...section.querySelectorAll('li')].some((li) => !li.querySelector('a'))) return 'newsletter';
  return 'legal';
}

function createElement(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/** Adopts fragment nodes into the page document. */
const adopt = (node) => document.importNode(node, true);

/**
 * Opens a modal dialog with an iframe (e.g. email signup).
 * @param {Element} modal
 * @param {string} src
 */
function openModal(modal, src) {
  const iframe = modal.querySelector('iframe');
  iframe.src = src;
  modal.hidden = false;
  document.body.classList.add('footer-modal-open');
  modal.querySelector('button').focus();
}

function closeModal(modal) {
  modal.hidden = true;
  modal.querySelector('iframe').src = 'about:blank';
  document.body.classList.remove('footer-modal-open');
}

/**
 * Builds the modal shell used by the newsletter form.
 * @param {string} title accessible dialog title (from content)
 * @param {string} closeLabel accessible close label (from content)
 */
function buildModal(title, closeLabel) {
  const modal = createElement('div', 'footer-modal', {
    role: 'dialog', 'aria-modal': 'true', 'aria-label': title,
  });
  modal.hidden = true;
  const close = createElement('button', 'footer-modal-close', { type: 'button', 'aria-label': closeLabel });
  close.textContent = '×';
  const iframe = createElement('iframe', 'footer-modal-frame', { title });
  modal.append(close, iframe);
  close.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(modal); });
  return modal;
}

/**
 * Newsletter: intro paragraph, action link (label + signup URL), list of
 * validation messages (required, invalid) and dialog title / close label.
 * @param {Element} section
 * @param {Element} block footer block (modal host)
 */
function buildNewsletter(section, block) {
  const wrapper = createElement('div', 'footer-newsletter');
  const paragraphs = [...section.querySelectorAll(':scope > p')];
  const intro = paragraphs.find((p) => p.querySelector('a') && !isLinkOnlyParagraph(p));
  const action = paragraphs.find(isLinkOnlyParagraph)?.querySelector('a');
  const [requiredMsg = '', invalidMsg = ''] = [...section.querySelectorAll('li')]
    .map((li) => li.textContent.trim());
  const [modalTitle = '', closeLabel = ''] = paragraphs
    .filter((p) => isTextOnlyParagraph(p)).map((p) => p.textContent.trim());

  if (intro) {
    const p = adopt(intro);
    p.className = 'footer-newsletter-intro';
    wrapper.append(p);
  }
  if (!action) return wrapper;

  const fieldId = 'footer-newsletter-email';
  const box = createElement('div', 'footer-field');
  const form = createElement('form', 'footer-newsletter-form', { novalidate: '' });
  const label = createElement('label', 'footer-field-label', { for: fieldId });
  label.textContent = action.textContent.trim();
  const input = createElement('input', 'footer-field-input', {
    id: fieldId, type: 'text', name: 'email', autocomplete: 'email', inputmode: 'email',
  });
  form.append(label, input);
  const submit = createElement('button', 'footer-field-submit', {
    type: 'button', 'aria-label': action.title || label.textContent,
  });
  box.append(form, submit);

  const errors = [requiredMsg, invalidMsg].map((msg) => {
    const el = createElement('p', 'footer-field-error', { role: 'alert' });
    el.textContent = msg;
    el.hidden = true;
    return el;
  });
  wrapper.append(box, ...errors);

  const modal = buildModal(modalTitle || label.textContent, closeLabel || modalTitle);
  block.append(modal);

  const syncFilled = () => box.classList.toggle('is-filled', !!input.value);
  input.addEventListener('input', () => {
    syncFilled();
    box.classList.remove('has-error');
    errors.forEach((el) => { el.hidden = true; });
  });
  input.addEventListener('focus', () => box.classList.add('is-focused'));
  input.addEventListener('blur', () => box.classList.remove('is-focused'));

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    let error = null;
    if (!value) [error] = errors;
    else if (!valid) [, error] = errors;
    errors.forEach((el) => { el.hidden = el !== error; });
    box.classList.toggle('has-error', !!error);
    if (error) return;
    const url = new URL(action.href);
    url.searchParams.set('email', value);
    openModal(modal, url.href);
  };
  form.addEventListener('submit', handleSubmit);
  submit.addEventListener('click', handleSubmit);
  return wrapper;
}

/**
 * Social icons: list of image-only links.
 * @param {Element} section
 */
function buildSocial(section) {
  const list = adopt(section.querySelector('ul'));
  list.className = 'footer-social';
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (img && !a.getAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
    img?.setAttribute('loading', 'lazy');
  });
  return list;
}

/**
 * Locale selector: label paragraph, list of links (flag image + country name)
 * and a placeholder paragraph. Rendered as a filterable combobox; the option
 * matching the current URL (or the first option) is selected.
 * @param {Element} section
 */
function buildLocale(section) {
  const [labelP, placeholderP] = [...section.querySelectorAll(':scope > p')];
  const entries = [...section.querySelectorAll('li a')].map((a) => ({
    name: a.textContent.trim(),
    href: a.href,
    flag: a.querySelector('img')?.getAttribute('src') || '',
  }));
  const here = window.location.pathname.replace(/\/$/, '');
  const selected = entries.find((en) => {
    const path = new URL(en.href).pathname.replace(/\/$/, '');
    return path && (here === path || here.startsWith(`${path}/`));
  }) || entries[0];

  const wrapper = createElement('div', 'footer-locale');
  const labelId = 'footer-locale-label';
  const listId = 'footer-locale-list';
  const label = createElement('p', 'footer-locale-label', { id: labelId });
  label.textContent = labelP?.textContent.trim() || '';

  const box = createElement('div', 'footer-locale-box', {
    role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-owns': listId,
  });
  const flag = createElement('img', 'footer-locale-flag', { alt: '', width: '30', height: '28' });
  const input = createElement('input', 'footer-locale-input', {
    type: 'text',
    'aria-labelledby': labelId,
    'aria-controls': listId,
    'aria-autocomplete': 'list',
    placeholder: placeholderP?.textContent.trim() || '',
  });
  const caret = createElement('span', 'footer-locale-caret', { 'aria-hidden': 'true' });
  box.append(flag, input, caret);

  const list = createElement('ul', 'footer-locale-list', { id: listId, role: 'listbox', 'aria-labelledby': labelId });
  list.hidden = true;
  entries.forEach((en) => {
    const li = createElement('li', en === selected ? 'is-active' : '', {
      role: 'option', tabindex: '0', 'aria-selected': String(en === selected),
    });
    li.textContent = en.name;
    li.dataset.href = en.href;
    list.append(li);
  });

  const showSelected = () => {
    input.value = selected?.name || '';
    flag.hidden = !selected?.flag;
    if (selected?.flag) flag.src = selected.flag;
  };
  const setOpen = (open) => {
    list.hidden = !open;
    box.setAttribute('aria-expanded', String(open));
    wrapper.classList.toggle('is-open', open);
    if (!open) {
      [...list.children].forEach((li) => { li.hidden = false; });
      showSelected();
    }
  };
  const go = (li) => { window.location.href = li.dataset.href; };

  box.addEventListener('click', (e) => {
    if (list.hidden) {
      setOpen(true);
      input.focus();
    } else if (e.target === caret) setOpen(false);
  });
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    [...list.children].forEach((li) => { li.hidden = !li.textContent.toLowerCase().includes(q); });
    if (list.hidden) setOpen(true);
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) go(li);
  });
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); input.focus(); }
    if (e.key === 'Enter' && e.target.closest('li')) go(e.target.closest('li'));
  });
  document.addEventListener('click', (e) => {
    if (!list.hidden && !wrapper.contains(e.target)) setOpen(false);
  });

  showSelected();
  wrapper.append(label, box, list);
  return wrapper;
}

/**
 * App badges: image-only links.
 * @param {Element} section
 */
function buildApps(section) {
  const wrapper = createElement('div', 'footer-apps');
  section.querySelectorAll('a').forEach((a) => {
    const link = adopt(a);
    const img = link.querySelector('img');
    if (img && !link.getAttribute('aria-label')) link.setAttribute('aria-label', img.alt);
    img?.setAttribute('loading', 'lazy');
    wrapper.append(link);
  });
  return wrapper;
}

/**
 * Link columns: every heading starts a new column with the following lists.
 * @param {Element} section
 */
function buildLinkColumns(section) {
  const nav = createElement('nav', 'footer-links');
  let column = null;
  [...section.children].forEach((child) => {
    if (/^H[1-6]$/.test(child.tagName)) {
      column = createElement('div', 'footer-links-column');
      const heading = adopt(child);
      heading.className = 'footer-links-heading';
      column.append(heading);
      nav.append(column);
    } else if (column) {
      const node = adopt(child);
      if (node.tagName === 'UL') {
        node.className = 'footer-links-list';
        node.setAttribute('aria-label', column.firstElementChild.textContent.trim());
      }
      column.append(node);
    }
  });
  return nav;
}

/**
 * Legal bar: copyright paragraph(s) and a list of legal links.
 * @param {Element} section
 */
function buildLegal(section) {
  const wrapper = createElement('div', 'footer-legal');
  [...section.children].forEach((child) => {
    const node = adopt(child);
    node.className = node.tagName === 'UL' ? 'footer-legal-links' : 'footer-copyright';
    wrapper.append(node);
  });
  return wrapper;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const sections = await fetchFooterSections();
  block.textContent = '';
  const main = createElement('div', 'footer-main');
  const top = createElement('div', 'footer-top');
  const regions = { top: [], body: [] };

  sections.forEach((section) => {
    const role = classifySection(section);
    if (role === 'newsletter') regions.top.push(buildNewsletter(section, block));
    else if (role === 'social') {
      const social = buildSocial(section);
      regions.top.push(social);
      // hidden duplicate of the social list for the small-screen layout
      const clone = social.cloneNode(true);
      clone.classList.add(MOBILE_CLONE_CLASS);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
      regions.body.push(clone);
    } else if (role === 'locale') regions.top.push(buildLocale(section));
    else if (role === 'apps') regions.body.push(buildApps(section));
    else if (role === 'links') regions.body.push(buildLinkColumns(section));
    else regions.body.push(buildLegal(section));
  });

  top.append(...regions.top);
  if (regions.top.length) main.append(top);
  main.append(...regions.body);
  block.prepend(main);

  // placeholder links ("#") are hooks for third-party tools — never jump to top
  block.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });
}
