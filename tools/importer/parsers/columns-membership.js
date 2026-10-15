/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-membership. Base: columns.
 * Source: https://www.lenovo.com/us/en/c/laptops/thinkpad/ (.card_immersive) — 1 instance
 * Output (2 columns):
 *   Row 1: background photo (own row; read from div.bgCover inline background-image) | ''
 *   Row 2: Lenovo Pro logo (.imageContainer img) | H2 heading (.heading), bullet list (ul),
 *          CTA link (only when the CTA has a real href)
 *
 * Source: .swiper-slide > div.bgCover[style*=background-image] > .swiperContainer >
 *   .logoContainer > img.imageLogo[src=""] (empty slot, ignored)
 *   .textContainer > div.heading[role=heading] + .descFourThreeOne > ul + .ctaFourThree > button "Learn More"
 *   .imageContainer > img (lenovo-pro-white.svg)
 * The "Learn More" control is a script-driven <button> with no href; the component config
 * has an empty cardLink. A link is only emitted if a real a[href] / data-href exists — otherwise
 * it is omitted, never invented.
 * The logo is an SVG: "?icon" is appended so helix-importer convertIcons() keeps a real image.
 * Generated: 2026-10-15 (laptops template)
 */
const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/i;

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function absolute(url) {
  try {
    return new URL(url, 'https://www.lenovo.com/').href;
  } catch (e) {
    return url;
  }
}

function keepSvg(img) {
  const src = img.getAttribute('src') || '';
  if (/\.svg$/i.test(src)) img.setAttribute('src', `${src}?icon`);
  return img;
}

export default function parse(element, { document }) {
  // Only the first (real) slide; swiper loop clones carry .swiper-slide-duplicate
  const slide = element.querySelector('.swiper-slide:not(.swiper-slide-duplicate)') || element;

  // Background photo
  let bgImg = null;
  const bgEl = slide.querySelector('.bgCover[style*="url("]')
    || [...slide.querySelectorAll('[style*="background-image"]')].find((el) => URL_RE.test(el.getAttribute('style')));
  const bgMatch = bgEl ? (bgEl.getAttribute('style') || '').match(URL_RE) : null;
  if (bgMatch) {
    bgImg = document.createElement('img');
    bgImg.src = absolute(bgMatch[1]);
    bgImg.alt = '';
  } else {
    bgImg = slide.querySelector('img.bgImage, .bgCover > img');
  }

  // Logo
  const logo = [...slide.querySelectorAll('.imageContainer img, .logoContainer img')]
    .find((img) => img.getAttribute('src'));
  if (logo) keepSvg(logo);

  // Copy
  const copy = [];
  const headingEl = slide.querySelector('.textContainer .heading, .textContainer [role="heading"], .textContainer h1, .textContainer h2, .textContainer h3');
  if (clean(headingEl && headingEl.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = clean(headingEl.textContent);
    copy.push(h2);
  }
  const desc = slide.querySelector('.textContainer [class^="desc"], .textContainer [class*=" desc"]');
  if (desc) {
    desc.querySelectorAll('ul, ol').forEach((list) => {
      const out = document.createElement(list.tagName.toLowerCase());
      list.querySelectorAll(':scope > li').forEach((li) => {
        if (!clean(li.textContent)) return;
        const item = document.createElement('li');
        item.innerHTML = li.innerHTML.trim();
        out.append(item);
      });
      if (out.children.length) copy.push(out);
    });
    desc.querySelectorAll(':scope > p').forEach((p) => {
      if (clean(p.textContent)) copy.push(p);
    });
  }
  const ctaWrap = slide.querySelector('.textContainer [class*="cta"], .textContainer .buttoncommen');
  if (ctaWrap) {
    const ctaEl = ctaWrap.querySelector('a[href], button, [role="button"]');
    const href = (ctaWrap.querySelector('a[href]') || { getAttribute: () => '' }).getAttribute('href')
      || (ctaEl && (ctaEl.getAttribute('data-href') || ctaEl.getAttribute('data-url'))) || '';
    if (href && !/^(#|javascript:)/i.test(href)) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = clean(ctaEl && ctaEl.textContent) || 'Learn More';
      const p = document.createElement('p');
      p.append(a);
      copy.push(p);
    }
  }

  if (!copy.length && !bgImg) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (bgImg) cells.push([bgImg, '']);
  cells.push([logo || '', copy]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-membership', cells });
  element.replaceWith(block);
}
