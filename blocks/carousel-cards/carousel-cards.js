import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

let carouselCount = 0;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function trimWhitespace(el) {
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });
}

function optimize(img, widths) {
  const picture = createOptimizedPicture(img.src, img.alt || '', false, widths);
  const newImg = picture.querySelector('img');
  if (img.getAttribute('width') && img.getAttribute('height')) {
    newImg.width = img.getAttribute('width');
    newImg.height = img.getAttribute('height');
  }
  return picture;
}

/** A <p> whose only meaningful content is links (optionally wrapped in strong/em). */
function isLinkOnlyParagraph(p) {
  const links = [...p.querySelectorAll('a[href]')];
  return links.length > 0
    && p.textContent.trim() === links.map((a) => a.textContent.trim()).join('');
}

function buildSlide(row, index, total, id) {
  // APG carousel: slides are role=group with aria-roledescription=slide (not list items)
  const slide = document.createElement('div');
  slide.className = 'carousel-cards-slide';
  slide.id = `carousel-cards-${id}-slide-${index}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const imgs = [...row.querySelectorAll('img')];
  const media = document.createElement('div');
  media.className = 'carousel-cards-slide-media';
  if (imgs[0]) {
    const bg = document.createElement('div');
    bg.className = 'carousel-cards-slide-art';
    bg.append(optimize(imgs[0], [{ media: '(width >= 600px)', width: '750' }, { width: '600' }]));
    media.append(bg);
  }
  if (imgs[1]) {
    const character = document.createElement('div');
    character.className = 'carousel-cards-slide-character';
    character.append(optimize(imgs[1], [{ width: '600' }]));
    media.append(character);
  }

  // text: everything that is not an image, from every cell
  const body = document.createElement('div');
  body.className = 'carousel-cards-slide-body';
  [...row.children].forEach((cell) => {
    // a lone <p> wrapping the whole cell is transparent
    const kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')
      && kids[0].textContent.trim()) {
      kids[0].replaceWith(...kids[0].childNodes);
    }
    [...cell.children].forEach((el) => {
      if (el.matches('picture, img')) return;
      if (el.querySelector('picture, img') && !el.textContent.trim()) return;
      el.querySelectorAll('picture, img').forEach((i) => i.remove());
      body.append(el);
    });
  });
  trimWhitespace(body);

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('carousel-cards-slide-title');

  const cta = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkOnlyParagraph);
  if (cta) {
    cta.classList.add('button-wrapper', 'carousel-cards-slide-cta');
    cta.querySelectorAll('a[href]').forEach((a) => {
      a.classList.add('button');
      // plain (local) and bold (published) links render the same filled CTA
      if (!['primary', 'secondary', 'accent'].some((v) => a.classList.contains(v))) {
        a.classList.add('primary');
      }
      // give generic "Learn More" links context for screen readers
      if (heading && !a.getAttribute('aria-label')) {
        a.setAttribute('aria-label', `${a.textContent.trim()}: ${heading.textContent.trim()}`);
      }
    });
  }

  if (media.children.length) slide.append(media);
  else slide.classList.add('carousel-cards-slide-no-media');
  slide.append(body);
  return slide;
}

/**
 * Accessible name for the carousel region: a heading in the block's own section,
 * else the heading of an immediately preceding heading-only section (a title band
 * authored as its own section, e.g. "Why Lenovo Gaming?"), else a generic label.
 */
function findLabel(block) {
  const section = block.closest('.section');
  const own = [...(section?.querySelectorAll('h1, h2, h3') || [])].find((h) => !block.contains(h));
  if (own) return own.textContent.trim();
  const prev = section?.previousElementSibling;
  const hasContentBlocks = prev && [...prev.querySelectorAll('.block')]
    .some((b) => !b.classList.contains('section-metadata'));
  if (prev && !hasContentBlocks) {
    const headings = [...prev.querySelectorAll('h1, h2, h3')];
    const last = headings[headings.length - 1];
    if (last?.textContent.trim()) return last.textContent.trim();
  }
  return 'Highlights';
}

function createButton(className, label, controls) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-controls', controls);
  return button;
}

/**
 * Card carousel (coverflow). Optional first row = a single band background
 * image. Then one row per slide: cell 1 = background art + character image,
 * cell 2 = heading, text and a CTA link.
 * @param {Element} block
 */
export default function decorate(block) {
  carouselCount += 1;
  const id = carouselCount;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  let rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('img'));

  // optional band background: a leading row with images but no text
  let background = null;
  if (rows.length > 1 && !rows[0].textContent.trim() && rows[0].querySelector('img')) {
    const img = rows[0].querySelector('img');
    background = document.createElement('div');
    background.className = 'carousel-cards-background';
    background.append(optimize(img, [{ media: '(width >= 900px)', width: '2000' }, { width: '900' }]));
    const bgImg = background.querySelector('img');
    bgImg.alt = '';
    background.setAttribute('aria-hidden', 'true');
    rows = rows.slice(1);
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', findLabel(block));

  const viewport = document.createElement('div');
  viewport.className = 'carousel-cards-viewport';
  const track = document.createElement('div');
  track.className = 'carousel-cards-slides';
  track.id = `carousel-cards-${id}-slides`;
  track.setAttribute('aria-live', 'polite');
  rows.forEach((row, i) => track.append(buildSlide(row, i, rows.length, id)));
  viewport.append(track);

  block.replaceChildren(...(background ? [background] : []), viewport);

  const slides = [...track.children];
  if (slides.length < 2) {
    block.classList.add('is-single');
    slides[0]?.classList.add('is-active');
    return;
  }

  const prev = createButton('carousel-cards-prev', 'Previous slide', track.id);
  const next = createButton('carousel-cards-next', 'Next slide', track.id);
  // controls precede the slides in reading/tab order (APG carousel)
  viewport.before(prev, next);

  let current = -1;

  const setActive = (index) => {
    if (index === current) return;
    current = index;
    slides.forEach((slide, i) => {
      const isActive = i === current;
      slide.classList.toggle('is-active', isActive);
      if (isActive) slide.setAttribute('aria-current', 'true');
      else slide.removeAttribute('aria-current');
    });
    // aria-disabled keeps the buttons focusable at either end
    prev.setAttribute('aria-disabled', current === 0);
    next.setAttribute('aria-disabled', current === slides.length - 1);
  };

  const scrollToSlide = (index) => {
    const target = slides[Math.max(0, Math.min(index, slides.length - 1))];
    const left = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
    track.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
    setActive(slides.indexOf(target));
  };

  // active slide = the one closest to the viewport center
  const syncFromScroll = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    setActive(best);
  };

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      syncFromScroll();
    });
  }, { passive: true });

  prev.addEventListener('click', () => { if (current > 0) scrollToSlide(current - 1); });
  next.addEventListener('click', () => { if (current < slides.length - 1) scrollToSlide(current + 1); });

  // keyboard focus on a slide's link brings that slide to the center
  track.addEventListener('focusin', (e) => {
    const slide = e.target.closest('.carousel-cards-slide');
    const index = slides.indexOf(slide);
    if (index >= 0 && index !== current) scrollToSlide(index);
  });

  block.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    scrollToSlide(current + (e.key === 'ArrowLeft' ? -1 : 1));
  });

  // start on the middle slide (coverflow shows neighbours on both sides)
  const start = Math.floor((slides.length - 1) / 2);
  setActive(start);
  const center = () => {
    const target = slides[start];
    track.scrollLeft = target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2;
  };
  if (track.clientWidth) {
    center();
  } else {
    // section may still be hidden while loading: center once it has a size
    const observer = new ResizeObserver(() => {
      if (!track.clientWidth) return;
      observer.disconnect();
      center();
    });
    observer.observe(track);
  }
}
