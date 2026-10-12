/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-article variant.
 * Base: hero. Source: https://wknd-adventures.com/blog/patagonia-trek.html
 * Selector: section.hero-section
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Background image from .hero-bg img
  const bgImg = element.querySelector('.hero-bg img');
  if (bgImg) {
    cells.push([bgImg]);
  }

  // Row 2: Content — breadcrumbs, tags, h1, author byline
  const contentWrapper = document.createElement('div');

  // Breadcrumbs
  const breadcrumbs = element.querySelector('.breadcrumbs');
  if (breadcrumbs) {
    const breadcrumbP = document.createElement('p');
    const links = breadcrumbs.querySelectorAll('a');
    const spans = breadcrumbs.querySelectorAll('span:not(:empty)');
    const parts = [];
    breadcrumbs.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const text = node.textContent.trim();
        if (text) parts.push(text);
      } else if (node.tagName === 'A') {
        const a = node.cloneNode(true);
        parts.push(a.outerHTML);
      } else if (node.tagName === 'SPAN' && node.textContent.trim()) {
        parts.push(node.textContent.trim());
      }
    });
    breadcrumbP.innerHTML = parts.join(' ');
    contentWrapper.appendChild(breadcrumbP);
  }

  // Tags
  const tagEl = element.querySelector('.tag');
  if (tagEl) {
    const tagP = document.createElement('p');
    tagP.textContent = tagEl.textContent.trim();
    contentWrapper.appendChild(tagP);
  }

  // H1 heading
  const h1 = element.querySelector('h1');
  if (h1) {
    const heading = document.createElement('h1');
    heading.textContent = h1.textContent.trim();
    contentWrapper.appendChild(heading);
  }

  // Author byline
  const byline = element.querySelector('.article-byline');
  if (byline) {
    const bylineDiv = document.createElement('div');
    const avatar = byline.querySelector('.avatar img, .article-byline img');
    if (avatar) {
      bylineDiv.appendChild(avatar.cloneNode(true));
    }
    const name = byline.querySelector('.article-byline-name');
    if (name) {
      const nameP = document.createElement('p');
      nameP.innerHTML = `<strong>${name.textContent.trim()}</strong>`;
      bylineDiv.appendChild(nameP);
    }
    const meta = byline.querySelector('.article-byline-meta');
    if (meta) {
      const metaP = document.createElement('p');
      metaP.textContent = meta.textContent.trim();
      bylineDiv.appendChild(metaP);
    }
    contentWrapper.appendChild(bylineDiv);
  }

  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Hero (article)',
    cells,
  });
  element.replaceWith(block);
}
