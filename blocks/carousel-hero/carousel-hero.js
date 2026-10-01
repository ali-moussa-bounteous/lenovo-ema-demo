import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];
const AUTOPLAY_INTERVAL = 6000;

let carouselCount = 0;

/**
 * Returns the image element of a cell when the cell holds only an image
 * (either a <picture> or a bare <img> inside a <p>).
 * @param {Element} cell
 * @returns {HTMLImageElement|null}
 */
function getOnlyImage(cell) {
  if (!cell || cell.children.length !== 1) return null;
  const child = cell.firstElementChild;
  if (child.tagName === 'PICTURE') return child.querySelector('img');
  if (child.tagName === 'P' && child.children.length === 1) {
    const inner = child.firstElementChild;
    if (inner.tagName === 'IMG') return inner;
    if (inner.tagName === 'PICTURE') return inner.querySelector('img');
  }
  return null;
}

function optimize(img, eager, widths) {
  const picture = createOptimizedPicture(img.src, img.alt, eager, widths);
  if (eager) picture.querySelector('img').setAttribute('fetchpriority', 'high');
  return picture;
}

function buildSlide(row, index, total, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.id = `carousel-hero-${id}-slide-${index}`;
  slide.dataset.slideIndex = index;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const cells = [...row.children];
  const imageCell = cells.find((cell) => getOnlyImage(cell));
  const contentCells = cells.filter((cell) => cell !== imageCell);

  const content = document.createElement('div');
  content.className = 'carousel-hero-slide-content';
  contentCells.forEach((cell) => content.append(...cell.childNodes));

  // optional logo: a leading image-only paragraph/picture before the heading
  const first = content.firstElementChild;
  if (first && !first.matches('h1, h2, h3, h4, h5, h6')) {
    const logoImg = first.tagName === 'PICTURE' ? first.querySelector('img') : first.querySelector(':scope > img, :scope > picture > img');
    if (logoImg && first.textContent.trim() === '') {
      const logo = document.createElement('div');
      logo.className = 'carousel-hero-slide-logo';
      logo.append(optimize(logoImg, index === 0, [{ width: '400' }]));
      first.replaceWith(logo);
    }
  }

  const ctas = [...content.querySelectorAll(':scope > p')].filter((p) => {
    const links = p.querySelectorAll('a');
    return links.length > 0 && p.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
  });
  if (ctas.length) {
    const actions = document.createElement('div');
    actions.className = 'carousel-hero-slide-actions';
    ctas[0].before(actions);
    actions.append(...ctas);
  }

  slide.append(content);

  if (imageCell) {
    const media = document.createElement('div');
    media.className = 'carousel-hero-slide-image';
    media.append(optimize(getOnlyImage(imageCell), index === 0, [{ media: '(min-width: 900px)', width: '1600' }, { width: '900' }]));
    slide.append(media);
  }

  return slide;
}

function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  return button;
}

export default function decorate(block) {
  carouselCount += 1;
  const id = carouselCount;
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  const rows = [...block.children].filter((row) => row.textContent.trim() || row.querySelector('img'));
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', 'Featured');

  const viewport = document.createElement('div');
  viewport.className = 'carousel-hero-viewport';
  const track = document.createElement('ul');
  track.className = 'carousel-hero-slides';
  track.id = `carousel-hero-${id}-slides`;
  track.setAttribute('aria-live', 'off');
  rows.forEach((row, i) => track.append(buildSlide(row, i, rows.length, id)));
  viewport.append(track);

  block.replaceChildren(viewport);

  const slides = [...track.children];
  if (slides.length < 2) {
    block.classList.add('is-single');
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'carousel-hero-controls';
  const prev = createButton('carousel-hero-prev', 'Previous slide');
  const next = createButton('carousel-hero-next', 'Next slide');
  const progress = document.createElement('div');
  progress.className = 'carousel-hero-progress';
  progress.setAttribute('aria-hidden', 'true');
  const bar = document.createElement('span');
  bar.className = 'carousel-hero-progress-bar';
  progress.append(bar);
  const pause = createButton('carousel-hero-pause', 'Pause slide rotation');
  [prev, next, pause].forEach((b) => b.setAttribute('aria-controls', track.id));
  controls.append(prev, next, progress, pause);
  block.append(controls);
  block.style.setProperty('--carousel-hero-interval', `${AUTOPLAY_INTERVAL}ms`);

  let current = 0;
  let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const restartProgress = () => {
    bar.classList.remove('is-running');
    // force reflow so the progress animation restarts
    // eslint-disable-next-line no-unused-expressions
    bar.offsetWidth;
    bar.classList.add('is-running');
  };

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, i) => {
      const isActive = i === current;
      slide.setAttribute('aria-hidden', !isActive);
      slide.classList.toggle('is-active', isActive);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (isActive) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    restartProgress();
  };

  const setPaused = (paused) => {
    block.classList.toggle('is-paused', paused);
    pause.setAttribute('aria-label', paused ? 'Start slide rotation' : 'Pause slide rotation');
    pause.setAttribute('aria-pressed', paused);
    track.setAttribute('aria-live', paused ? 'polite' : 'off');
  };

  bar.addEventListener('animationend', () => show(current + 1));
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  pause.addEventListener('click', () => {
    userPaused = !userPaused;
    setPaused(userPaused);
  });

  // pause temporarily while the user interacts with the slides
  block.addEventListener('focusin', () => setPaused(true));
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) setPaused(userPaused);
  });

  setPaused(userPaused);
  show(0);
}
