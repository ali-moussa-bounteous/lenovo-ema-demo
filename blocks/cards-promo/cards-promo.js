const OPTION_CLASSES = [];

/** A <p> whose only meaningful content is one link (optionally wrapped in strong/em). */
function isLinkOnlyParagraph(p) {
  const links = p.querySelectorAll('a[href]');
  return links.length === 1 && p.textContent.trim() === links[0].textContent.trim();
}

function buildItem(row) {
  const li = document.createElement('li');
  li.className = 'cards-promo-item';

  [...row.children].forEach((cell) => {
    // a lone <p> wrapper around the whole cell is transparent
    const kids = [...cell.children];
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('h1, h2, h3, h4, h5, h6, p')) {
      li.append(...kids[0].childNodes);
    } else {
      li.append(...cell.childNodes);
    }
  });
  [...li.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
  });

  const heading = li.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('cards-promo-title');

  // last link-only paragraph becomes the box's button
  const cta = [...li.querySelectorAll(':scope > p')].reverse().find(isLinkOnlyParagraph);
  if (cta) {
    cta.classList.add('button-wrapper', 'cards-promo-cta');
    const a = cta.querySelector('a');
    a.classList.add('button');
    // plain links (local/imported) and bold links (published, buttonized by
    // decorateButtons) must render the same filled CTA
    if (!['primary', 'secondary', 'accent'].some((v) => a.classList.contains(v))) {
      a.classList.add('primary');
    }
    if (!a.title) a.title = a.textContent.trim();
  }
  return li;
}

/**
 * Promo boxes: one row per box with heading, text and a button link.
 * Rendered as stacked, centered panels.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (active.length) block.dataset.options = active.join(' ');

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) return;
    ul.append(buildItem(row));
  });
  block.replaceChildren(ul);
}
