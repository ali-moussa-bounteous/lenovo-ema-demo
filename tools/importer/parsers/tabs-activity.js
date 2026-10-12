/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs (activity browser).
 * Outputs a section heading + each tab as a separate section with style=tabs,
 * containing a Cards (cards-article) block.
 * Selector: .tab-container.tab-container--wide
 */
export default function parse(element, { document }) {
  const tabButtons = element.querySelectorAll('.tab-menu-link, [role="tab"]');
  const tabPanes = element.querySelectorAll('.tab-pane, [role="tabpanel"]');

  const fragment = document.createDocumentFragment();

  // Emit the section heading that precedes the tab container (e.g., "Browse by Activity")
  // and remove it from the DOM so the sections transformer doesn't duplicate it
  const parentSection = element.closest('.section, section');
  if (parentSection) {
    const sectionHeading = parentSection.querySelector('.section-heading, .section-title');
    if (sectionHeading) {
      const h2 = document.createElement('h2');
      h2.textContent = sectionHeading.textContent.trim();
      fragment.appendChild(h2);
      fragment.appendChild(document.createElement('hr'));
      sectionHeading.remove();
    }
  }

  tabButtons.forEach((btn, i) => {
    const pane = tabPanes[i];
    if (!pane) return;

    const label = btn.textContent.trim();

    // Create section
    const section = document.createElement('div');

    // Tab label as heading
    const h3 = document.createElement('h3');
    h3.textContent = label;
    section.appendChild(h3);

    // Build Cards (cards-article) block from article cards in the pane
    const articleCards = pane.querySelectorAll('.article-card');
    const cardCells = [];

    articleCards.forEach((card) => {
      const img = card.querySelector('.article-card-image img');

      const bodyCol = document.createElement('div');

      const tag = card.querySelector('.tag');
      if (tag) {
        const tagP = document.createElement('p');
        tagP.textContent = tag.textContent.trim();
        bodyCol.appendChild(tagP);
      }

      const heading = card.querySelector('h3, h4, h5, h6');
      if (heading) {
        const h = document.createElement('h3');
        const href = card.getAttribute('href');
        if (href) {
          const a = document.createElement('a');
          a.href = href;
          a.textContent = heading.textContent.trim();
          h.appendChild(a);
        } else {
          h.textContent = heading.textContent.trim();
        }
        bodyCol.appendChild(h);
      }

      const desc = card.querySelector('.article-card-body p');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        bodyCol.appendChild(p);
      }

      cardCells.push([img || '', bodyCol]);
    });

    if (cardCells.length > 0) {
      const cardsBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Cards (cards-article)',
        cells: cardCells,
      });
      section.appendChild(cardsBlock);
    }

    // Section metadata: style=tabs
    const metaTable = WebImporter.Blocks.createBlock(document, {
      name: 'Section Metadata',
      cells: [['style', 'tabs']],
    });
    section.appendChild(metaTable);

    // Section separator
    section.appendChild(document.createElement('hr'));

    fragment.appendChild(section);
  });

  element.replaceWith(fragment);
}
