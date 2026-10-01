/* eslint-disable */

/**
 * Footer fragment importer.
 * Parses the original site's footer and produces the EDS footer fragment structure:
 *   Section 1 (top): brand column + link columns with h4 headings
 *   Section 2 (bottom): copyright + tagline paragraphs
 */

const BASE = '/';

function rewriteHref(href) {
  if (!href) return href;
  try {
    const p = new URL(href, 'https://wknd-adventures.com').pathname
      .replace(/\/$/, '').replace(/\.html$/, '').replace(/^\//, '');
    if (!p || p === 'index') return BASE.slice(0, -1) + '/';
    return BASE + p;
  } catch { return href; }
}

export default {
  transform: ({ document, url }) => {
    const main = document.body;
    const footer = main.querySelector('.footer');
    if (!footer) return [];

    const result = document.createElement('div');

    // === Section 1: Footer top (brand + link columns) ===
    const footerTop = footer.querySelector('.footer-top');

    if (footerTop) {
      const cols = footerTop.querySelectorAll(':scope > div');
      cols.forEach((col) => {
        const logoEl = col.querySelector('.footer-logo');

        if (logoEl) {
          // Brand column: link + tagline
          const brandP = document.createElement('p');
          const brandA = document.createElement('a');
          brandA.href = rewriteHref('/');
          brandA.textContent = 'WKND Adventures';
          brandP.appendChild(brandA);
          result.appendChild(brandP);

          const tagline = col.querySelector('p');
          if (tagline) {
            const tagP = document.createElement('p');
            tagP.textContent = tagline.textContent.trim();
            result.appendChild(tagP);
          }
        } else {
          // Link column: h4 heading + ul list
          const h4 = col.querySelector('h4');
          if (h4) {
            const heading = document.createElement('h4');
            heading.textContent = h4.textContent.trim();
            result.appendChild(heading);
          }

          const links = col.querySelectorAll('li a');
          if (links.length > 0) {
            const ul = document.createElement('ul');
            links.forEach((a) => {
              const li = document.createElement('li');
              const newA = document.createElement('a');
              newA.href = rewriteHref(a.getAttribute('href'));
              newA.textContent = a.textContent.trim();
              li.appendChild(newA);
              ul.appendChild(li);
            });
            result.appendChild(ul);
          }
        }
      });
    }

    // --- Section break ---
    result.appendChild(document.createElement('hr'));

    // === Section 2: Footer bottom (copyright) ===
    const footerBottom = footer.querySelector('.footer-bottom');

    if (footerBottom) {
      const paragraphs = footerBottom.querySelectorAll('p');
      paragraphs.forEach((p) => {
        const newP = document.createElement('p');
        newP.textContent = p.textContent.trim();
        result.appendChild(newP);
      });
    }

    return [{
      element: result,
      path: '/footer',
    }];
  },
};
