/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-article variant.
 * Base: cards. Source: https://wknd-adventures.com/blog/patagonia-trek.html
 * Selector: .grid-layout.desktop-3-column:has(.article-card)
 * Generated: 2026-03-25
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.article-card');
  const cells = [];

  cards.forEach((card) => {
    // Column 1: card image
    const img = card.querySelector('.article-card-image img');
    const col1 = document.createElement('div');
    if (img) {
      col1.appendChild(img.cloneNode(true));
    }

    // Column 2: card body content (tag, title, description, author/date)
    const col2 = document.createElement('div');

    const tag = card.querySelector('.tag');
    if (tag) {
      const tagP = document.createElement('p');
      tagP.textContent = tag.textContent.trim();
      col2.appendChild(tagP);
    }

    const title = card.querySelector('h3, h4, h5');
    const href = card.getAttribute('href');
    if (title) {
      const h3 = document.createElement('h3');
      // If the card is a link, make the title a link (no separate "Read More")
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title.textContent.trim();
        h3.appendChild(a);
      } else {
        h3.textContent = title.textContent.trim();
      }
      col2.appendChild(h3);
    }

    const desc = card.querySelector('.paragraph-sm, .paragraph-md, .paragraph-lg');
    if (desc) {
      const descP = document.createElement('p');
      descP.textContent = desc.textContent.trim();
      col2.appendChild(descP);
    }

    // Only add utility text if it differs from description (avoids duplicate content)
    const authorDate = card.querySelector('.utility-text-secondary, .text-secondary, .text-muted');
    if (authorDate) {
      const descText = desc ? desc.textContent.trim() : '';
      const utilityText = authorDate.textContent.trim();
      if (utilityText && utilityText !== descText) {
        const authorP = document.createElement('p');
        authorP.innerHTML = `<em>${utilityText}</em>`;
        col2.appendChild(authorP);
      }
    }

    cells.push([col1, col2]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards (cards-article)',
    cells,
  });
  element.replaceWith(block);
}
