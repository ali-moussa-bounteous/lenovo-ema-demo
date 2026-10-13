/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-cards. Base: carousel.
 * Source: https://www.lenovo.com/us/en/gaming/ (section.carousel-espot) — 1 instance, 5 slides
 * ("Why Lenovo Gaming?" card carousel).
 * Output (2 columns):
 *   Optional first row: single image cell = band background (.carousel-espot__bg-image)
 *   One row per slide (article.carousel-espot__slide):
 *     [background art image (.carousel-espot__image) + character image (.carousel-espot__hover-image)
 *      | H3 headline + description paragraph + "Learn More" link paragraph]
 * The cleanup transformer renames h2.carousel-espot__headline -> h3 (class kept), so the headline
 * is selected by class first, then by any heading.
 * Swiper clones (.swiper-slide-duplicate, loop mode) and repeated slides are skipped so each
 * unique slide is emitted once. Slides are block-level <article> wrappers (iteration safe).
 * Image src kept as captured.
 * Generated: 2026-10-12
 */
export default function parse(element, { document }) {
  const cells = [];

  // Optional band background row (decorative, image only)
  const bandBg = element.querySelector('.carousel-espot__bg img, img.carousel-espot__bg-image');
  if (bandBg) cells.push([bandBg, '']);

  let slides = [...element.querySelectorAll('article.carousel-espot__slide')];
  if (!slides.length) slides = [...element.querySelectorAll('.carousel-espot__slide, .swiper-slide')];

  const seen = new Set();
  slides.forEach((slide) => {
    if (slide.classList.contains('swiper-slide-duplicate')) return;

    const headlineEl = slide.querySelector('.carousel-espot__headline')
      || slide.querySelector('h1, h2, h3, h4, h5, h6');
    const descEl = slide.querySelector('.carousel-espot__description')
      || slide.querySelector('.carousel-espot__content-layout p, p');
    const ctaEl = slide.querySelector('a.carousel-espot__cta[href]')
      || slide.querySelector('.carousel-espot__overlay a[href], a[href]');

    const headline = headlineEl ? headlineEl.textContent.trim() : '';
    const desc = descEl ? descEl.textContent.trim() : '';
    const href = ctaEl ? ctaEl.getAttribute('href') : '';

    const key = `${headline}|${href}`;
    if (!headline && !desc && !href) return;
    if (seen.has(key)) return;
    seen.add(key);

    // Media cell: background art first, then the character image
    const media = [];
    const bgArt = slide.querySelector('.carousel-espot__media img, picture img.carousel-espot__image, img.carousel-espot__image');
    const character = slide.querySelector('img.carousel-espot__hover-image');
    if (bgArt) media.push(bgArt);
    if (character && character !== bgArt) media.push(character);

    const content = [];
    if (headline) {
      const h3 = document.createElement('h3');
      h3.textContent = headline;
      content.push(h3);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = ctaEl.textContent.trim() || 'Learn More';
      p.append(a);
      content.push(p);
    }

    cells.push([media.length ? media : '', content]);
  });

  // Nothing but (maybe) a background: not a carousel
  if (cells.length === 0 || (cells.length === 1 && bandBg)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-cards', cells });
  element.replaceWith(block);
}
