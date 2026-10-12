/* eslint-disable */

/**
 * Nav fragment importer.
 * Parses the original site's navbar and produces the EDS nav fragment structure:
 *   Section 1 (brand): <p><a>WKND Adventures</a></p>
 *   Section 2 (sections): nested <ul> with megamenu content
 *   Section 3 (tools): <p><strong><a>Subscribe</a></strong></p>
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
    const navbar = main.querySelector('.navbar');
    if (!navbar) return [];

    const result = document.createElement('div');

    // === Section 1: Brand ===
    const logo = navbar.querySelector('.logo');
    const brandP = document.createElement('p');
    const brandA = document.createElement('a');
    brandA.href = rewriteHref(logo?.getAttribute('href') || '/');
    brandA.textContent = 'WKND Adventures';
    brandP.appendChild(brandA);
    result.appendChild(brandP);

    // --- Section break ---
    result.appendChild(document.createElement('hr'));

    // === Section 2: Navigation sections (megamenu) ===
    const topUl = document.createElement('ul');

    // Get megamenu panels from the rendered page
    const menuItems = navbar.querySelectorAll('.nav-megamenu-item, .nav-menu-item');
    if (menuItems.length > 0) {
      menuItems.forEach((item) => {
        const trigger = item.querySelector('.nav-megamenu-trigger, .nav-menu-trigger, button');
        const label = trigger?.querySelector('span')?.textContent?.trim()
          || trigger?.textContent?.trim()?.replace(/\s+/g, ' ') || '';
        const panel = item.querySelector('.nav-megamenu');

        const topLi = document.createElement('li');
        topLi.textContent = label;

        if (panel) {
          const links = panel.querySelectorAll('a');
          if (links.length > 0) {
            // Check for article links (Stories panel has two <ul>)
            const regularLinks = [...links].filter(a => !a.classList.contains('nav-megamenu-article'));
            const articleLinks = [...links].filter(a => a.classList.contains('nav-megamenu-article'));

            // First <ul>: regular links
            const subUl = document.createElement('ul');
            regularLinks.forEach((a) => {
              const li = document.createElement('li');
              const newA = document.createElement('a');
              newA.href = rewriteHref(a.getAttribute('href'));
              const titleEl = a.querySelector('[class*="title"]');
              const descEl = a.querySelector('[class*="desc"]');
              newA.textContent = titleEl?.textContent?.trim() || a.textContent?.trim()?.split('\n')[0];
              li.appendChild(newA);
              if (descEl) {
                const br = document.createElement('br');
                li.appendChild(br);
                li.appendChild(document.createTextNode(descEl.textContent.trim()));
              }
              subUl.appendChild(li);
            });
            topLi.appendChild(subUl);

            // Second <ul>: article links (if any)
            if (articleLinks.length > 0) {
              const artUl = document.createElement('ul');
              const artContainer = document.createElement('li');
              // Section label
              const sectionLabel = panel.querySelector('[class*="label"]');
              artContainer.textContent = sectionLabel?.textContent?.trim() || 'Recent from the Field';
              const artSubUl = document.createElement('ul');
              articleLinks.forEach((a) => {
                const li = document.createElement('li');
                const newA = document.createElement('a');
                newA.href = rewriteHref(a.getAttribute('href'));
                const titleEl = a.querySelector('[class*="title"]');
                const descEl = a.querySelector('[class*="desc"]');
                newA.textContent = titleEl?.textContent?.trim() || a.textContent?.trim()?.split('\n')[0];
                li.appendChild(newA);
                if (descEl) {
                  const br = document.createElement('br');
                  li.appendChild(br);
                  li.appendChild(document.createTextNode(descEl.textContent.trim()));
                }
                artSubUl.appendChild(li);
              });
              artContainer.appendChild(artSubUl);
              artUl.appendChild(artContainer);
              topLi.appendChild(artUl);
            }
          }
        }
        topUl.appendChild(topLi);
      });
    } else {
      // Fallback: parse from static link list
      const allLinks = navbar.querySelectorAll('a.nav-megamenu-link, a.nav-megamenu-article');
      // Group by parent megamenu panel
      console.log('Nav: no .nav-menu-item found, using static link fallback');
    }

    result.appendChild(topUl);

    // --- Section break ---
    result.appendChild(document.createElement('hr'));

    // === Section 3: Tools (Subscribe button) ===
    const subLink = navbar.querySelector('.button, .nav-subscribe');
    if (subLink) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = rewriteHref(subLink.getAttribute('href'));
      a.textContent = subLink.textContent.trim().replace(/\s+/g, ' ');
      strong.appendChild(a);
      p.appendChild(strong);
      result.appendChild(p);
    }

    return [{
      element: result,
      path: '/nav',
    }];
  },
};
