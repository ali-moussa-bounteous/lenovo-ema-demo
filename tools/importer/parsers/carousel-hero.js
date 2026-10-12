/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.lenovo.com/us/en/ (.carousel.panelcontainer)
 * Output: one row per slide -> [slide image | content]
 *   content = optional logo image paragraph, heading (H1 first slide, H2 others),
 *             description paragraph, CTA paragraphs (first CTA wrapped in <strong>).
 * Generated: 2026-09-29
 */
export default function parse(element, { document }) {
  // Validated: div.cmp-carousel__item (one per slide) inside .cmp-carousel__content
  let slides = [...element.querySelectorAll('.cmp-carousel__item')];
  if (!slides.length) slides = [...element.querySelectorAll('.len-hero-banner')];

  const cells = [];
  slides.forEach((slide, index) => {
    // Slide photo: .landing-hero-media img (fallback: any img not inside the logo wrapper)
    let photo = slide.querySelector('.landing-hero-media img');
    if (!photo) {
      photo = [...slide.querySelectorAll('img')]
        .find((img) => !img.closest('[class*="content-logo"]')) || null;
    }

    const content = [];

    // Optional logo image
    const logo = slide.querySelector('[class*="inner-content-logo"] img');
    if (logo && logo !== photo) {
      const p = document.createElement('p');
      p.append(logo);
      content.push(p);
    }

    // Heading: normalise to H1 for first slide, H2 for others
    const srcHeading = slide.querySelector('.len-hero-banner__wrapper-bg-inner-content-titles h1, .len-hero-banner__wrapper-bg-inner-content-titles h2')
      || slide.querySelector('h1, h2, h3');
    if (srcHeading) {
      const h = document.createElement(index === 0 ? 'h1' : 'h2');
      h.innerHTML = srcHeading.innerHTML;
      content.push(h);
    }

    // Description paragraph(s)
    const titles = slide.querySelector('.len-hero-banner__wrapper-bg-inner-content-titles');
    const descs = titles ? [...titles.querySelectorAll('p')] : [...slide.querySelectorAll('p.body-large')];
    descs.forEach((d) => {
      if (!d.textContent.trim()) return;
      const p = document.createElement('p');
      p.innerHTML = d.innerHTML;
      content.push(p);
    });

    // CTAs: anchors inside .action (fallback: a.cta with href)
    let ctas = [...slide.querySelectorAll('.action a[href]')];
    if (!ctas.length) ctas = [...slide.querySelectorAll('a.cta[href]')];
    ctas.forEach((a, i) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      const p = document.createElement('p');
      if (i === 0) {
        const strong = document.createElement('strong');
        strong.append(link);
        p.append(strong);
      } else {
        p.append(link);
      }
      content.push(p);
    });

    if (!photo && !content.length) return;
    cells.push([photo || '', content]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
