/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs with team profiles.
 * Outputs each tab as a section with style=tabs containing a Team Profile block.
 * Selector: section:has(.tab-menu):has(.profile-circle)
 */
export default function parse(element, { document }) {
  const tabButtons = element.querySelectorAll('.tab-menu-link, [role="tab"]');
  const tabPanes = element.querySelectorAll('.tab-pane, [role="tabpanel"]');

  const fragment = document.createDocumentFragment();

  // Emit the section heading that precedes the tabs (e.g., "The team")
  // and remove it from the DOM so the sections transformer doesn't duplicate it
  const sectionHeading = element.querySelector('.section-heading, .section-title');
  if (sectionHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionHeading.textContent.trim();
    fragment.appendChild(h2);
    fragment.appendChild(document.createElement('hr'));
    sectionHeading.remove();
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

    // Build Team Profile block content
    const profileCells = [];

    // Avatar column
    const avatarCol = document.createElement('div');
    const profileImg = pane.querySelector('.profile-circle img, .avatar img, .profile-image img');
    if (profileImg) {
      avatarCol.appendChild(profileImg.cloneNode(true));
    }
    const name = pane.querySelector('.profile-name');
    if (name) {
      const nameP = document.createElement('p');
      nameP.textContent = name.textContent.trim();
      avatarCol.appendChild(nameP);
    }

    // Text column
    const textCol = document.createElement('div');
    const nameEl = pane.querySelector('.profile-name');
    const role = pane.querySelector('.profile-role, .profile-title')
      || (nameEl && nameEl.nextElementSibling && nameEl.nextElementSibling.tagName === 'P' ? nameEl.nextElementSibling : null);
    if (role) {
      const em = document.createElement('em');
      em.textContent = role.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(em);
      textCol.appendChild(p);
    }
    const bioContainer = pane.querySelector('.team-profile-bio');
    if (bioContainer) {
      const paragraphs = bioContainer.querySelectorAll('p');
      paragraphs.forEach((para) => {
        const newP = document.createElement('p');
        newP.textContent = para.textContent.trim();
        textCol.appendChild(newP);
      });
    }

    profileCells.push([avatarCol, textCol]);

    const profileBlock = WebImporter.Blocks.createBlock(document, {
      name: 'Team Profile',
      cells: profileCells,
    });
    section.appendChild(profileBlock);

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
