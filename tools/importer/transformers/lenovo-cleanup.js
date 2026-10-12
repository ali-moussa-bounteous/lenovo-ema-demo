/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Lenovo site-wide cleanup.
 * Removes non-authorable site chrome, widgets and tracking from lenovo.com pages.
 * All selectors verified in migration-work/cleaned.html (https://www.lenovo.com/us/en/).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global header + footer. These live in experience fragments that are
    // siblings of the page content grid (not siblings of the .len-card-grid
    // sections), so removing them early does not shift any :nth-of-type
    // selector used by parsers or the sections transformer.
    WebImporter.DOMUtils.remove(element, [
      // Header XF: <div class="cmp-experiencefragment cmp-experiencefragment--flash-header-experience-fragment">
      // contains nav.commonHeader, the rewards/deals promo strip
      // (section.x-cms-merchandizingbanner) and div.public-store-alert
      '.cmp-experiencefragment--flash-header-experience-fragment',
      'nav.commonHeader',
      '.commonHeaderPlaceHolder',
      'section.x-cms-merchandizingbanner',
      // Footer XF: <div class="cmp-experiencefragment cmp-experiencefragment--flash-footer-experience-fragment">
      // contains footer.commonFooter (+ iframe#footer_mask_iframe)
      '.cmp-experiencefragment--flash-footer-experience-fragment',
      'footer.commonFooter',
    ]);

    // Overlays / widgets that could interfere with parsing
    WebImporter.DOMUtils.remove(element, [
      '#INDWrap', // accessibility widget (INDmenu-btn, INDpopup, INDquickAccess)
      '#_evidon_banner', // cookie consent banner (evidon)
      '#inside_holder', // live chat (inside_liveChatTab) + lenovoSurveyWidget
      '#len-global-modal', // global video/iframe modal shell
      '#len-featured-merchandising-modal', // merchandising modal shell
      '.marketo-form-modal', // marketo form modal shell
      '#store-alert-pc', // empty store alert container
      'input#currentpage', // hidden input
      '#lenovoSurveyWidget', // floating "Feedback" survey launcher
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Tracking pixels and third-party frames
    WebImporter.DOMUtils.remove(element, [
      '[id^="batBeacon"]', // bing UET beacon div + imgs
      'img[src*="bat.bing.com"]',
      'iframe#qualaroo_dnt_frame',
      'iframe', // doubleclick floodlight + empty tracking iframes; no authorable iframes on page
    ]);

    // Empty HTML embeds: <div class="htmlEmbed base-component"> with only comments
    element.querySelectorAll('.htmlEmbed').forEach((embed) => {
      if (!embed.textContent.trim() && !embed.querySelector('img, picture, video, iframe, a')) {
        embed.remove();
      }
    });

    // Visual spacer dividers between content sections:
    // <div class="divider base-component section"><div class="divider-wrapper ..."><hr class="divider-hr ..."></div></div>
    // Removed only after parsing, since they count toward the :nth-of-type
    // positions of sibling .len-card-grid sections. Targets the wrapper, not
    // bare <hr>, so section breaks inserted by lenovo-sections.js survive.
    WebImporter.DOMUtils.remove(element, ['div.divider.base-component']);

    // Card-grid section titles use H3/H4 in the source for visual sizing;
    // normalize them to H2 so the page keeps a proper heading hierarchy.
    element.querySelectorAll('.card-grid__section-header :is(h3, h4, h5, h6)').forEach((heading) => {
      const h2 = element.ownerDocument.createElement('h2');
      h2.innerHTML = heading.innerHTML;
      heading.replaceWith(h2);
    });

    // Leftover non-content elements
    WebImporter.DOMUtils.remove(element, ['link', 'noscript', 'script', 'style', 'meta']);

    // Attribute cleanup
    element.querySelectorAll('[data-track], [onclick]').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
    });
  }
}
