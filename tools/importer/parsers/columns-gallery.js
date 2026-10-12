/* eslint-disable */
/* global WebImporter */

/**
 * Parser for gallery block.
 * Source: https://wknd-adventures.com/index.html
 * Selector: .inverse-section .grid-layout.desktop-3-column (excluding card grids)
 */
export default function parse(element, { document }) {
  // Row 1: Gallery images from the 3-column grid
  const gridImages = element.querySelectorAll('.gallery-img, :scope > img, :scope img');
  const row1 = [];
  gridImages.forEach((img) => {
    row1.push(img);
  });

  const cells = [];
  if (row1.length > 0) {
    cells.push(row1);
  }

  // Row 2: Wide image — any image in the parent section/container that isn't inside the grid
  const parent = element.parentElement;
  if (parent) {
    const allParentImages = parent.querySelectorAll('img');
    const gridImageSet = new Set(gridImages);
    for (const img of allParentImages) {
      // Skip images that are part of the grid
      if (gridImageSet.has(img) || element.contains(img)) continue;
      cells.push([img]);
      // Remove the wide image's wrapper if it's a direct child of parent
      let wrapper = img;
      while (wrapper.parentElement && wrapper.parentElement !== parent) {
        wrapper = wrapper.parentElement;
      }
      if (wrapper !== element && wrapper.parentElement === parent) {
        wrapper.remove();
      }
      break;
    }
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Gallery',
    cells,
  });
  element.replaceWith(block);
}
