/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND cleanup.
 * Removes non-authorable site chrome from the WKND source pages.
 * Selectors from captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove non-authorable site chrome (header nav, footer, skip link)
    // Must run before section splitting so nav/footer elements don't interfere with section selectors
    WebImporter.DOMUtils.remove(element, [
      '.navbar',
      'nav',
      'header',
      '[role="navigation"]',
      '.footer',
      'footer',
      '[role="contentinfo"]',
      '.skip-link',
      '[class*="skip"]',
      'noscript',
      'link',
      'iframe',
    ]);

    // Split .button-group links into separate <p><strong><a> wrappers
    // so EDS decorates each link as a button.
    // The import DOM may merge adjacent <a> tags, so use .button-label spans
    // as the reliable indicator of individual buttons.
    element.querySelectorAll('.button-group').forEach((group) => {
      const { document } = payload;
      const labels = group.querySelectorAll('.button-label');

      if (labels.length > 0) {
        // Each .button-label is inside a separate <a> — extract text + href from parent
        const count = labels.length;
        [...labels].forEach((label, i) => {
          const link = label.closest('a');
          const text = label.textContent.trim();
          const href = link ? link.getAttribute('href') || '' : '';
          const isGhost = link && link.classList.contains('button--ghost');

          const a = document.createElement('a');
          a.href = href;
          a.textContent = text;
          const p = document.createElement('p');

          if (!isGhost && (count === 1 || i === 0)) {
            // Multi-button: first is primary
            const strong = document.createElement('strong');
            strong.appendChild(a);
            p.appendChild(strong);
          } else {
            // Multi-button: subsequent are secondary
            const em = document.createElement('em');
            em.appendChild(a);
            p.appendChild(em);
          }
          group.before(p);
        });
      } else {
        // Fallback: process all <a> tags directly
        const links = [...group.querySelectorAll('a')];
        links.forEach((link, i) => {
          const a = document.createElement('a');
          a.href = link.getAttribute('href') || '';
          a.textContent = link.textContent.trim();
          const p = document.createElement('p');

          if (links.length === 1 || i === 0) {
            const strong = document.createElement('strong');
            strong.appendChild(a);
            p.appendChild(strong);
          } else {
            const em = document.createElement('em');
            em.appendChild(a);
            p.appendChild(em);
          }
          group.before(p);
        });
      }
      group.remove();
    });
  }
  if (hookName === TransformHook.afterTransform) {
    // Resolve all relative image URLs to absolute using the source page URL
    // Runs after block parsing so parser-created images are also resolved
    const sourceUrl = payload.params && payload.params.originalURL;
    if (sourceUrl) {
      element.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            img.setAttribute('src', new URL(src, sourceUrl).href);
          } catch (e) {
            // skip malformed URLs
          }
        }
      });
    }
  }
}
