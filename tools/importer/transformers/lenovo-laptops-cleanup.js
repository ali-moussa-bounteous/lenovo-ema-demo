/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Lenovo laptops series listing cleanup
 * (https://www.lenovo.com/us/en/c/laptops/thinkpad/, template "laptops").
 *
 * Laptops-specific counterpart of lenovo-cleanup.js / lenovo-gaming-cleanup.js
 * (both left untouched). Static-content migration: there is no Commerce backend,
 * so live-catalog chrome (facets, sort, compare, ratings, wishlist, rewards,
 * pagination) is dropped while product names, prices, images, spec bullets and
 * CTA links stay in place for the block parsers.
 * All selectors verified in migration-work/cleaned.html (ThinkPad scrape).
 *
 * Body-level layout of the source page:
 *   body > div#INDWrap                          accessibility toolbar      -> removed
 *   body > h1 / h2                              hidden SEO headings        -> removed
 *   body > div.page_config_info                 CMS tooling                -> removed
 *   body > div.page_body
 *          > div[id="$_fragment_uuid"] (1st)    header fragment (nav.commonHeader) -> removed
 *          > main.main_content                  page content               -> KEPT
 *          > div[id="$_fragment_uuid"] (2nd)    footer fragment (footer.commonFooter) -> removed
 *   body > help dock, snackbars, modals, consent, Lenovo Pro join bar,
 *          compare/tooltip popups, chat, tracking iframes/pixels       -> removed
 *
 * Inside main.main_content:
 *   - empty anchor-target spacers (div.container9999 > ... > .anchor-content-view-pc)
 *     and other text-less/image-less containers                       -> removed
 *   - CMS layout gradient background images (lenovo-gradient-portion-0N)
 *     that are direct children of layout wrappers; replaced by the
 *     "purple-gradient" section style                                 -> removed
 *   - Reviews section (div:has(.bazaarVoice), incl. its "Reviews" H2) -> removed
 *   - "Reviews" button in the anchor nav                              -> removed
 *   - hero heading breakpoint copies (.heroTitle .mobileOnly/.tabletOnly) -> removed
 *   - duplicated responsive CTA links (…-cta-btn a + …-cta-link a)    -> one kept
 *   - PLP chrome in the listing + accessory carousel chrome           -> removed
 *
 * No heading-level changes here (hero parser promotes its H2 to H1).
 * No lazy-image fix needed: cleaned.html has no data-src placeholders.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function isBlank(el) {
  return !el.textContent.replace(/ /g, ' ').trim()
    && !el.querySelector('img, picture, video, iframe, svg, table, hr');
}

// Climb from a node to its ancestor that is a direct child of main.main_content.
function mainChildOf(node) {
  let cur = node;
  while (cur && cur.parentElement) {
    if (cur.parentElement.matches('main.main_content')) return cur;
    cur = cur.parentElement;
  }
  return null;
}

// Collapse adjacent <hr> elements (e.g. when a section's content was removed
// after a break was inserted). Keeps the <hr> carrying a section marker.
function collapseAdjacentHrs(element) {
  element.querySelectorAll('hr').forEach((hr) => {
    if (!hr.isConnected) return;
    let next = hr.nextSibling;
    while (next && next.nodeType === 3 && !next.textContent.trim()) next = next.nextSibling;
    if (next && next.nodeType === 1 && next.tagName === 'HR') {
      const keepNext = next.attributes.length > 0 || hr.attributes.length === 0;
      if (keepNext) hr.remove();
      else next.remove();
    }
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // --- Non-content elements (first, so blank-container checks are accurate) ---
    WebImporter.DOMUtils.remove(element, ['script', 'style', 'noscript', 'link', 'meta', 'template']);

    // --- Global chrome ------------------------------------------------------
    // Header + footer CMS fragments are the direct div[id="$_fragment_uuid"]
    // children of div.page_body (main.main_content sits between them). Nested
    // $_fragment_uuid wrappers inside main hold page content and are kept.
    element.querySelectorAll('.page_body > [id="$_fragment_uuid"]').forEach((frag) => {
      if (!frag.querySelector('main')) frag.remove();
    });
    WebImporter.DOMUtils.remove(element, [
      '.commonHeaderPlaceHolder',
      'nav.commonHeader',
      'footer.commonFooter',
      '.fragment-placeholder',
      '.page_config_info', // CMS tooling (tooltip/highlight/fps toggles)
      '.ui-toggle', // button#uiToggleTopStart, button#uiToggleBottom
    ]);
    // Hidden SEO headings at body level:
    // <h1>Lenovo ThinkPad Laptops for Business</h1> <h2>Shop ThinkPad by Series</h2>
    element.querySelectorAll(':scope > h1, :scope > h2, :scope > h3').forEach((h) => h.remove());

    // --- Widgets, popups, consent, login, help dock --------------------------
    WebImporter.DOMUtils.remove(element, [
      '#INDWrap', // accessibility toolbar
      '#_evidon_banner', // cookie consent banner
      '.bottomStickyDock', // back-to-top + compare dock (help dock)
      '.Q26696HelpLine', // Lenovo Pro join bar (.wpc-lenovo-pro-hub-benefits-sticky-banner)
      '.wpc-lenovo-pro-hub-benefits-sticky-banner',
      '#inside_holder', // live chat tab
      '#proCommunity', // Lenovo Pro terms popup
      '.sheer-id-popup', // SheerID success modal
      '.sheerIDsuccess',
      '.rbkey_content_none', // hidden i18n strings for modals
      '#snackbar',
      '#globalSnackBar',
      '#timerLoggedOut',
      '#dlp-new-login',
      '.public-store-alert',
      '#store-alert-pc',
      '#test',
      '.common-compare-popup', // body-level "compare" bubbles
      '.tool-tip-popup', // body-level facet tooltips
      '.le-popover', // price/rewards popovers (body-level and inline)
      '[id^="crl8-gallery"][id$="-modal"]', // Curalate video-commerce modal
    ]);

    // --- Hidden / screen-reader-only clutter --------------------------------
    WebImporter.DOMUtils.remove(element, [
      '.sr-only', // "Add To Cart" in hero, srAnnouncer_*, carousel status, etc.
      '.espot-main__visually-hidden', // "Featured content"
      '.INDhiddenText',
    ]);

    // --- Reviews section (excluded: live Bazaarvoice/Curalate UGC) ---------------
    // main.main_content > div.comp_lazyload:has(.bazaarVoice), including its
    // h2 "Reviews" layout title. Resolved without :has() for DOM-engine safety.
    element.querySelectorAll('.bazaarVoice').forEach((bv) => {
      const container = mainChildOf(bv);
      if (container) container.remove();
      else bv.remove();
    });
    // Anchor nav "Reviews" jump button (its target section is gone).
    element.querySelectorAll('.anchor_nav .anchor_nav__text').forEach((btn) => {
      if (btn.textContent.trim().toLowerCase() === 'reviews') btn.remove();
    });

    // --- Responsive duplicates -----------------------------------------------
    // Hero heading is rendered 3x: keep .desktopOnly, drop the others.
    WebImporter.DOMUtils.remove(element, ['.heroTitle .mobileOnly', '.heroTitle .tabletOnly']);
    // Spotlight / featured cards repeat each CTA:
    //   div.*-cta-btn > a[href=X]  +  a.*-cta-link[href=X]   -> keep the first.
    [
      ['.small_content_container-cta-btn a', 'a.small_content_container-cta-link'],
      ['.medium_content_container_text-cta-btn a', 'a.medium_content_container_text-cta-link'],
    ].forEach(([primarySel, dupSel]) => {
      element.querySelectorAll(dupSel).forEach((dup) => {
        const scope = dup.parentElement;
        const primary = scope && scope.querySelector(primarySel);
        if (primary && primary !== dup
          && (primary.getAttribute('href') || '') === (dup.getAttribute('href') || '')) {
          dup.remove();
        }
      });
    });
    // Empty flip-card backs, captions and decorative play/close icons
    WebImporter.DOMUtils.remove(element, [
      '.small_content_flip_container',
      '.medium_content_flip_container',
      '.medium_content_play',
      '.dx-thinkpad-yt-video-play', // play-icon overlay on the video poster
    ]);
    element.querySelectorAll('.small_content .caption, .mediumContainer .caption').forEach((el) => {
      if (isBlank(el)) el.remove();
    });
    // Logo <img> without src (empty CMS slots)
    element.querySelectorAll('img.small_content_container_text_logo, img.medium_content_container_text_logo').forEach((img) => {
      if (!img.getAttribute('src')) img.remove();
    });

    // --- CMS layout background gradients -------------------------------------
    // lenovo-gradient-portion-0N-desktop.jpg as direct children of layout wrappers.
    element.querySelectorAll(
      '.fujiSmallMediumLayout > img, [class^="cms_background_layout_"] > img, .cms_layoutBox_auto_height > img',
    ).forEach((img) => img.remove());

    // --- Product listing (PLP) chrome — section "View All Thinkpad Products" ---
    WebImporter.DOMUtils.remove(element, [
      'section.pc_left_facets', // filters, "Expand All", sort, price_sort dropdown
      '.facet_filter',
      '.query_view_wrap', // "52 Matching results", "Clear All", sort button
      '.matching_results',
      '.sortbtn',
      '.price_sort',
      '.al_unavailable_view',
      '#dlpGroupLoadEl',
      '.skeleton_product_card', // loading shimmer
      '.pc_footer_page', // "Showing 1 - 9 of 52 Results" + "Load more results"
      '.pc_loading', // "One moment please..."
      '.facetName',
      '.facetId',
    ]);

    // --- Product-card chrome (listing + spotlight + accessories) -------------
    WebImporter.DOMUtils.remove(element, [
      '.common-compare-container', // "Compare" checkbox
      '.rating-box', // listing star ratings wrapper
      '.rating_container', // accessory star ratings wrapper
      '.card-rating-container',
      '.pc_fps_rating',
      '.card-wish_popover', // accessory wishlist heart + "Save to" list popover
      '.card-wish-container',
      '.hover_image .mask', // listing hover mask: wishlist heart + gallery/video buttons
      '.heart',
      '.productGalleryOverride',
      '.loyalty-container', // "My Lenovo Rewards / Earn $N in Rewards / Join Now!"
      '.loyalty-price-color',
      '.tool_tip_container', // tooltip icon next to "Est Value"
    ]);

    // --- Carousel chrome ----------------------------------------------------
    WebImporter.DOMUtils.remove(element, [
      '.swiper-pagination',
      '.swiper-pagination_dots_card', // product carousel dots
      '.swiper-button-next',
      '.swiper-button-prev',
      '.swiper-notification',
      '.SplitterProductCarousel .prevBtn', // accessory carousel arrows
      '.SplitterProductCarousel .nextBtn',
      '.card_immersive .other-content',
    ]);

    // --- Empty spacer containers ---------------------------------------------
    // Anchor-target placeholders (.anchor-content-view-pc), html_upload with only
    // a <link>, etc. Deepest first so nested empties are handled before parents.
    [...element.querySelectorAll('div.container9999')].reverse().forEach((c) => {
      if (c.isConnected && isBlank(c)) c.remove();
    });
    element.querySelectorAll('main.main_content > div').forEach((c) => {
      if (isBlank(c)) c.remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Tracking pixels and third-party frames (block-owned iframes are left alone)
    WebImporter.DOMUtils.remove(element, [
      '[id^="batBeacon"]',
      'img[src*="bat.bing.com"]',
      '#qualaroo_dnt_frame',
    ]);
    element.querySelectorAll('iframe').forEach((f) => { if (!f.closest('table')) f.remove(); });

    // Leftover non-content elements
    WebImporter.DOMUtils.remove(element, ['link', 'noscript', 'script', 'style', 'meta', 'template', 'select', 'button:empty']);

    // If a section break ended up with nothing behind it (e.g. Reviews removed
    // after a break was inserted), collapse the duplicate <hr>.
    collapseAdjacentHrs(element);

    // Attribute cleanup
    element.querySelectorAll('[data-track], [onclick]').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
    });
  }
}
