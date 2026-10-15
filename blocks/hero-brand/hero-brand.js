import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function trimWhitespace(el) {
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
}

function optimize(img, eager, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', eager, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/** A cell whose only content is a single image (picture/img, optionally in a <p>). */
function isImageOnlyCell(cell) {
  return cell.querySelectorAll('img').length === 1 && cell.textContent.trim() === '';
}

/** A paragraph whose only content is one or more linked images (e.g. an OS badge). */
function isBadgeParagraph(el) {
  return el.tagName === 'P' && el.textContent.trim() === ''
    && el.querySelector('a[href] img') && [...el.querySelectorAll('img')].every((img) => img.closest('a[href]'));
}

/**
 * Pulls a badge-only default-content run authored just above the hero (in the
 * same section) into the hero, where it is pinned top-right like on the source.
 * Anything else in that wrapper is left where it is.
 * @returns {Element[]} the badge paragraphs that were moved
 */
function adoptLeadingBadges(block) {
  const wrapper = block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return [];
  const children = [...prev.children];
  if (!children.length || !children.every(isBadgeParagraph)) return [];
  prev.remove();
  return children;
}

/**
 * Hero brand: full-bleed background photo with centred logo, heading and CTA.
 * Row 1 = background photo; row 2 = logo image, heading, link(s).
 * Tolerates a single cell with everything (first image becomes the background
 * only when it sits alone in its own cell), extra rows, or no image at all.
 * A linked badge image (e.g. "Get to know Windows 11") authored in the hero
 * content, or as default content directly above the hero in its section, is
 * pinned to the hero's top-right corner.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const badges = adoptLeadingBadges(block);
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const bgCell = cells.find(isImageOnlyCell);

  const media = document.createElement('div');
  media.className = 'hero-brand-media';
  if (bgCell) {
    const img = bgCell.querySelector('img');
    // first visible image on the page: load eagerly
    const picture = optimize(img, true, [
      { media: '(width >= 900px)', width: '2000' },
      { width: '900' },
    ]);
    picture.querySelector('img').setAttribute('fetchpriority', 'high');
    media.append(picture);
  }

  const content = document.createElement('div');
  content.className = 'hero-brand-content';
  cells.filter((cell) => cell !== bgCell).forEach((cell) => {
    content.append(...cell.childNodes);
  });
  trimWhitespace(content);

  // logo / badge images inside the content: optimise, keep their links
  const badgeWrappers = [];
  [...content.querySelectorAll('img'), ...badges.flatMap((p) => [...p.querySelectorAll('img')])]
    .forEach((img) => {
      const old = img.closest('picture') || img;
      const picture = optimize(img, true, [{ width: '600' }]);
      old.replaceWith(picture);
      const p = picture.closest('p');
      if (p && p.textContent.trim() === '' && !p.querySelector('a')) p.classList.add('hero-brand-logo');
      const a = picture.closest('a');
      if (a) {
        a.classList.add('hero-brand-badge');
        const wrap = a.closest('p') || a;
        wrap.classList.add('hero-brand-badge-wrapper');
        if (!badgeWrappers.includes(wrap)) badgeWrappers.push(wrap);
      }
    });

  block.replaceChildren();
  if (bgCell) block.append(media);
  else block.classList.add('hero-brand-no-image');
  if (content.childNodes.length) block.append(content);
  // badges sit outside the centred column, pinned to the hero corner
  if (badgeWrappers.length) {
    const corner = document.createElement('div');
    corner.className = 'hero-brand-badges';
    corner.append(...badgeWrappers);
    block.append(corner);
  }
}
