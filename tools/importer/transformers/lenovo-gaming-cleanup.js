/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Lenovo gaming template cleanup (https://www.lenovo.com/us/en/gaming/).
 *
 * Gaming-specific counterpart of lenovo-cleanup.js (which stays untouched for the
 * homepage). The gaming page is built on the Lenovo "flash" CMS layout, not the
 * AEM experience-fragment layout of the homepage, so the chrome selectors differ.
 * All selectors verified in migration-work/cleaned.html (gaming page scrape).
 *
 * Body-level layout of the source page:
 *   body > div#INDWrap                      accessibility toolbar        -> removed
 *   body > h1 / h2 / h3                     hidden SEO headings          -> removed
 *   body > div.page_config_info             CMS tooling                  -> removed
 *   body > div.page_body
 *          > div[id="$_fragment_uuid"]      header fragment (nav.commonHeader,
 *                                           section.x-cms-merchandizingbanner) -> removed
 *          > main.main_content              breadcrumb + hero, topics + sidebar,
 *                                           Shop/Explore panels          -> KEPT
 *   body > div.container9999#75bf06...      "Why Lenovo Gaming?" title band +
 *                                           section.carousel-espot       -> KEPT
 *   body > span ("测试文本"), div[id="$_fragment_uuid"] (footer.commonFooter) -> removed
 *   body > widgets, popups, consent, chat, tracking iframes/pixels       -> removed
 *
 * Heading normalization (source has no visible H1 and skips levels). Done in
 * beforeTransform so block parsers pick up the final levels; the replacement
 * keeps every attribute (class, id) so class-based parser selectors still match.
 *
 * Page metadata: afterTransform appends a single Metadata block with Title,
 * Description, Image (same sources as WebImporter.rules.createMetadata) plus
 * Theme: dark. The gaming import script must therefore NOT also call
 * WebImporter.rules.createMetadata (it would append a second Metadata block).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// Hidden SEO text injected by the CMS before the footer fragment: <span>测试文本</span>
const SEO_TEST_TEXT = '测试文本';

function renameTag(el, tagName) {
  if (!el || el.tagName.toLowerCase() === tagName) return el;
  const doc = el.ownerDocument;
  const replacement = doc.createElement(tagName);
  [...el.attributes].forEach((attr) => replacement.setAttribute(attr.name, attr.value));
  while (el.firstChild) replacement.appendChild(el.firstChild);
  el.replaceWith(replacement);
  return replacement;
}

// Remove the closest CMS fragment wrapper (<div id="$_fragment_uuid">) around a
// chrome element, but never a wrapper that also holds page content.
function removeFragmentAround(element, chromeSelector) {
  element.querySelectorAll(chromeSelector).forEach((chrome) => {
    const fragment = chrome.closest('[id="$_fragment_uuid"]');
    const target = fragment
      && !fragment.querySelector('main, .resources-hero-image, .left-img-right-txt, .shop-links-ul, .gaminghp_common_title_wrap, section.carousel-espot')
      ? fragment
      : chrome;
    target.remove();
  });
}

function isBlank(el) {
  return !el.textContent.replace(/ /g, ' ').trim()
    && !el.querySelector('img, picture, video, iframe, a, svg');
}

function metaContent(doc, selectors) {
  for (const sel of selectors) {
    const m = doc.querySelector(sel);
    if (m && m.getAttribute('content')) return m.getAttribute('content').trim();
  }
  return '';
}

function findMetadataTable(element) {
  return [...element.querySelectorAll('table')].find((table) => {
    const firstCell = table.querySelector('tr > th, tr > td');
    return firstCell && firstCell.textContent.trim().toLowerCase() === 'metadata';
  });
}

function addPageMetadata(element) {
  const doc = element.ownerDocument;
  const existing = findMetadataTable(element);
  if (existing) {
    // A Metadata block already exists (e.g. re-run): only add the Theme row.
    const hasTheme = [...existing.querySelectorAll('tr > td:first-child')]
      .some((td) => td.textContent.trim().toLowerCase() === 'theme');
    if (!hasTheme) {
      const tr = doc.createElement('tr');
      const k = doc.createElement('td');
      const v = doc.createElement('td');
      k.textContent = 'Theme';
      v.textContent = 'dark';
      tr.append(k, v);
      existing.querySelector('tbody, table').append(tr);
    }
    return;
  }

  const meta = {};
  const titleEl = doc.querySelector('head > title, title');
  const title = (titleEl && titleEl.textContent.replace(/[\n\t]/gm, '').trim())
    || metaContent(doc, ['meta[property="og:title"]']);
  if (title) meta.Title = title;

  const description = metaContent(doc, ['meta[property="og:description"]', 'meta[name="description"]']);
  if (description) meta.Description = description;

  const ogImage = metaContent(doc, ['meta[property="og:image"]']);
  if (ogImage) {
    const img = doc.createElement('img');
    img.src = ogImage;
    meta.Image = img;
  }

  // Whole page is black with white text (authoring-analysis pageMetadata.theme).
  meta.Theme = 'dark';

  const block = WebImporter.Blocks.getMetadataBlock
    ? WebImporter.Blocks.getMetadataBlock(doc, meta)
    : WebImporter.Blocks.createBlock(doc, { name: 'Metadata', cells: meta });
  element.append(block);
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Global chrome ------------------------------------------------------
    // Header fragment: page_body > div[id="$_fragment_uuid"] containing
    // div.commonHeaderPlaceHolder, nav.commonHeader and the promo strip
    // section.x-cms-merchandizingbanner ("For price matching ... call a Sales Specialist").
    removeFragmentAround(element, 'nav.commonHeader');
    // Footer fragment: body > div[id="$_fragment_uuid"] > ... > footer.commonFooter
    // (includes iframe#footer_mask_iframe and the email signup dialog).
    removeFragmentAround(element, 'footer.commonFooter');
    WebImporter.DOMUtils.remove(element, [
      '.commonHeaderPlaceHolder',
      'nav.commonHeader',
      'section.x-cms-merchandizingbanner',
      'footer.commonFooter',
      '.fragment-placeholder', // loading shimmer <img alt="shine"> in the header fragment
      '.page_config_info', // CMS tooling (tooltip/highlight/fps toggles)
    ]);

    // Hidden SEO headings at body level: <h1>Lenovo Gaming Resources</h1><h2></h2><h3></h3>
    // (the visible H1 is produced from the hero banner heading below).
    element.querySelectorAll(':scope > h1, :scope > h2, :scope > h3').forEach((h) => h.remove());
    // Hidden "测试文本" span before the footer fragment.
    element.querySelectorAll(':scope > span').forEach((span) => {
      if (span.textContent.trim() === SEO_TEST_TEXT) span.remove();
    });

    // --- Widgets, popups, consent, chat ------------------------------------
    WebImporter.DOMUtils.remove(element, [
      '#INDWrap', // accessibility toolbar (INDmenu-btn, INDpopup, INDquickAccess)
      '#_evidon_banner', // cookie consent banner
      '#inside_holder', // live chat tab (inside_liveChatTab)
      '.bottomStickyDock', // back-to-top, compare dock, feedback, "Need Help? Call", chat now
      '#lenovoSurveyWidget', // floating "Feedback" survey launcher
      '.Q27443ExpBwpc-popup', // product-recommendation popup overlapping the hero
      '#proCommunity', // Lenovo Pro terms popup
      '.sheer-id-popup', // sign-in / SheerID success modal
      '.sheerIDsuccess',
      '.rbkey_content_none', // hidden i18n strings for the modals
      '#globalSnackBar',
      '#snackbar',
      '#timerLoggedOut',
      '.public-store-alert',
      '#store-alert-pc',
      '#test', // empty div#test
    ]);

    // --- Hidden / screen-reader-only clutter --------------------------------
    WebImporter.DOMUtils.remove(element, [
      '.sr-only', // merchandizing carousel status, email dialog labels
      '.carousel-espot__sr', // "Carousel switched to slide 1 of 5 ..."
      '.carousel-espot__sr-text', // "Previous/Next carousel arrow"
      '.swiper-notification',
      '.INDhiddenText',
    ]);

    // --- Main content clean-up ----------------------------------------------
    // Empty breadcrumb shell in the first main container:
    // <div class="edu-breadcrumb-links"><div id="breadcumbs_top"></div><h2 id="body_head_top"></h2></div>
    // (the real breadcrumb .breadcrumb-links is kept as default content).
    WebImporter.DOMUtils.remove(element, ['.edu-breadcrumb-links']);
    // "Find Articles by Category" dropdown (select#FindArticles) duplicates the 5 topic links.
    WebImporter.DOMUtils.remove(element, ['.drop-down-bdr .text_normal_right', 'select#FindArticles']);
    // Empty clearfix divs between topic rows: <div class="float-left-both"></div>
    element.querySelectorAll('.float-left-both').forEach((el) => { if (isBlank(el)) el.remove(); });
    // Shop panel list has a trailing empty <li>&nbsp;&nbsp;</li>
    element.querySelectorAll('.shop-links-ul li').forEach((li) => { if (isBlank(li)) li.remove(); });
    // Duplicate hidden "Learn More" link per recommended product (name link is authored).
    WebImporter.DOMUtils.remove(element, ['.widgets_merchandising_reel_pc_container .product a.more']);
    // Decorative chevrons (empty divs/spans styled via CSS)
    WebImporter.DOMUtils.remove(element, ['.gaminghp_common_title_wrap .down-arrow', '.carousel-espot__chevron']);

    // --- Heading normalization (attributes preserved) ------------------------
    // Hero banner heading is the page H1: .resource-herowht-txt h2 -> h1
    element.querySelectorAll('.resources-hero-image .resource-herowht-txt h2').forEach((h) => renameTag(h, 'h1'));
    // "Explore Gaming Topics" section heading: h3 -> h2 ("Popular Categories" stays h3)
    element.querySelectorAll('.drop-down-bdr .head_left_text h3:not(.heading-three-img)').forEach((h) => renameTag(h, 'h2'));
    // Topic card titles: .text-right-resources h4 -> h3
    element.querySelectorAll('.left-img-right-txt .text-right-resources h4').forEach((h) => renameTag(h, 'h3'));
    // Sidebar promo box titles: div.edu-font-bold-big-black -> h3
    element.querySelectorAll('.edu-right-box-bg-img .edu-font-bold-big-black').forEach((h) => renameTag(h, 'h3'));
    // Sidebar "Recommended Gaming Products": h4.recommended_head -> h3
    element.querySelectorAll('.widgets_merchandising_reel_pc_container h4.recommended_head').forEach((h) => renameTag(h, 'h3'));
    // Shop / Explore panel headings: .shop-links-ul h5 -> h2
    element.querySelectorAll('.shop-links-ul h5').forEach((h) => renameTag(h, 'h2'));
    // "Why Lenovo Gaming?" (.gaminghp_common_title_wrap h2) is already h2.
    // Carousel slide headlines: h2.carousel-espot__headline -> h3
    element.querySelectorAll('section.carousel-espot h2.carousel-espot__headline').forEach((h) => renameTag(h, 'h3'));
  }

  if (hookName === TransformHook.afterTransform) {
    // Tracking pixels and third-party frames
    WebImporter.DOMUtils.remove(element, [
      '[id^="batBeacon"]', // bing UET beacon div + imgs
      'img[src*="bat.bing.com"]',
      'iframe', // qualaroo, doubleclick floodlight, IND props, empty frames; no authorable iframes
    ]);

    // Leftover non-content elements
    WebImporter.DOMUtils.remove(element, ['link', 'noscript', 'script', 'style', 'meta', 'select', 'button:empty']);

    // Empty headings left by the CMS (e.g. any remaining <h2></h2>)
    element.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => { if (isBlank(h)) h.remove(); });

    // Attribute cleanup
    element.querySelectorAll('[data-track], [onclick]').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
    });

    // Page-level metadata: Title / Description / Image + Theme: dark
    addPageMetadata(element);
  }
}
