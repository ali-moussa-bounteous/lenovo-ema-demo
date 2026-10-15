/* eslint-disable */
/* global WebImporter */

// Import script for template "laptops" (Lenovo US laptop series listing pages,
// e.g. /us/en/c/laptops/thinkpad/). Static-content migration: product tiles,
// prices and specs are authored content (no commerce backend).
// Source URLs end with a slash; documents are written without it
// (/us/en/c/laptops/thinkpad), as for the gaming page.

// PARSER IMPORTS
import heroBrandParser from './parsers/hero-brand.js';
import anchorNavStickyParser from './parsers/anchor-nav-sticky.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsRevealParser from './parsers/cards-reveal.js';
import columnsSpotlightParser from './parsers/columns-spotlight.js';
import cardsBenefitParser from './parsers/cards-benefit.js';
import columnsMembershipParser from './parsers/columns-membership.js';
import cardsFeaturedParser from './parsers/cards-featured.js';
import cardsSeriesParser from './parsers/cards-series.js';
import cardsListingParser from './parsers/cards-listing.js';
import cardsProductAccessoriesParser from './parsers/cards-product-accessories.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS (laptops-specific; home and gaming keep their own)
import lenovoLaptopsCleanupTransformer from './transformers/lenovo-laptops-cleanup.js';
import lenovoLaptopsSectionsTransformer from './transformers/lenovo-laptops-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "laptops",
  "urls": [
    "https://www.lenovo.com/us/en/c/laptops/thinkpad/"
  ],
  "representativeUrl": "https://www.lenovo.com/us/en/c/laptops/thinkpad/",
  "description": "Lenovo laptop series listing page (/us/en/c/laptops/{series}/), static product content",
  "blocks": [
    {
      "name": "hero-brand",
      "instances": [
        "section.x-cms-ofp-fe-common-hero-v2"
      ]
    },
    {
      "name": "anchor-nav-sticky",
      "instances": [
        ".anchor_nav"
      ]
    },
    {
      "name": "embed-video",
      "instances": [
        ".dx-thinkpad-yt-video-facade"
      ]
    },
    {
      "name": "cards-reveal",
      "instances": [
        ".layouts_special_content_wishlist:has(section.student-espot)"
      ]
    },
    {
      "name": "columns-spotlight",
      "instances": [
        ".layouts_special_content_2columns11"
      ]
    },
    {
      "name": "cards-benefit",
      "instances": [
        ".layouts_special_content_3columns:has(.iconcard-vertical-list__item)"
      ]
    },
    {
      "name": "columns-membership",
      "instances": [
        ".card_immersive"
      ]
    },
    {
      "name": "cards-featured",
      "instances": [
        ".layouts_special_content_3columns:has(.small_content)"
      ]
    },
    {
      "name": "cards-series",
      "instances": [
        ".x-cms-ofp-fe-2c-widgets-segmentespots"
      ]
    },
    {
      "name": "cards-listing",
      "instances": [
        "section.productCard_container.card-product-list"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".SplitterProductCarousel:not(.layouts_special_content_2columns11 .SplitterProductCarousel)"
      ]
    },
    {
      "name": "accordion-faq",
      "instances": [
        "section.x-cms-ai-ofp-fe-2c-accordion"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "ThinkPad brand hero",
      "selector": [
        "main.main_content > div:has(section.x-cms-ofp-fe-common-hero-v2)",
        "section.x-cms-ofp-fe-common-hero-v2"
      ],
      "style": null,
      "blocks": [
        "hero-brand"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Sticky in-page anchor nav (alone in its section)",
      "selector": [
        "main.main_content > div:has(.anchor_nav)",
        ".anchor_nav"
      ],
      "style": null,
      "blocks": [
        "anchor-nav-sticky"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Discover ThinkPad: intro, video, feature reveal tiles",
      "selector": [
        "main.main_content > div:has(.dx-thinkpad-yt-video-facade)"
      ],
      "style": "dark",
      "blocks": [
        "embed-video",
        "cards-reveal"
      ],
      "defaultContent": [
        "main.main_content > div:has(.dx-thinkpad-yt-video-facade) h2.dx-big-section-headline",
        "main.main_content > div:has(.dx-thinkpad-yt-video-facade) p.dx-copy-offset"
      ]
    },
    {
      "id": "section-4",
      "name": "What's new, benefits, Lenovo Pro, featured ThinkPads, series categories",
      "selector": [
        "main.main_content > div:has(.layouts_special_content_2columns11)"
      ],
      "style": "purple-gradient",
      "blocks": [
        "columns-spotlight",
        "cards-benefit",
        "columns-membership",
        "cards-featured",
        "cards-series"
      ],
      "defaultContent": [
        "h2.dx-small-fuji-card",
        "span.dx-small-section-headline",
        "main.main_content > div:has(.small_content):has(.fujiSmallMediumLayout) span.dx-big-section-headline",
        "main.main_content > div:has(.x-cms-ofp-fe-2c-widgets-segmentespots) h2.dx-big-section-headline"
      ]
    },
    {
      "id": "section-5",
      "name": "View all ThinkPad products (static listing)",
      "selector": [
        "main.main_content > div:has(section.card-product-list)"
      ],
      "style": null,
      "blocks": [
        "cards-listing"
      ],
      "defaultContent": [
        "main.main_content > div:has(section.card-product-list) h2.dx-big-section-headline"
      ]
    },
    {
      "id": "section-6",
      "name": "Reviews UGC carousel (excluded: live Bazaarvoice feed; removed by cleanup)",
      "selector": [
        "main.main_content > div:has(.bazaarVoice)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "section-7",
      "name": "Accessories, services, FAQ",
      "selector": [
        "main.main_content > div:has(.SplitterProductCarousel):not(:has(.layouts_special_content_2columns11))"
      ],
      "style": "dark",
      "blocks": [
        "cards-product",
        "cards-featured",
        "accordion-faq"
      ],
      "defaultContent": [
        "main.main_content > div:has(.SplitterProductCarousel):not(:has(.layouts_special_content_2columns11)) h2.dx-big-section-headline"
      ]
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-brand': heroBrandParser,
  'anchor-nav-sticky': anchorNavStickyParser,
  'embed-video': embedVideoParser,
  'cards-reveal': cardsRevealParser,
  'columns-spotlight': columnsSpotlightParser,
  'cards-benefit': cardsBenefitParser,
  'columns-membership': columnsMembershipParser,
  'cards-featured': cardsFeaturedParser,
  'cards-series': cardsSeriesParser,
  'cards-listing': cardsListingParser,
  'cards-product': cardsProductAccessoriesParser,
  'accordion-faq': accordionFaqParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks / section metadata
const transformers = [
  lenovoLaptopsCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [lenovoLaptopsSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Block "${blockDef.name}" selector not supported: ${selector}`);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// Lenovo renders most of this page in lazy containers (main > div.comp_lazyload)
// that only fill in when scrolled into view; before that they hold just an
// empty .comp_lazyload_resource placeholder. Product images inside them are
// lazy too.
function pendingLazyContainers(document) {
  return [...document.querySelectorAll('main .comp_lazyload')]
    .filter((el) => ![...el.children].some((c) => !c.classList.contains('comp_lazyload_resource')))
    .length;
}

export default {
  // Awaited by the importer before transform: scroll through the page so every
  // lazy section (and its images) renders, then return to the top.
  onLoad: async ({ document }) => {
    const win = document.defaultView || window;
    const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
    for (let pass = 0; pass < 3; pass += 1) {
      const step = Math.round((win.innerHeight || 800) * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        win.scrollTo(0, y);
        // eslint-disable-next-line no-await-in-loop
        await sleep(250);
      }
      // eslint-disable-next-line no-await-in-loop
      await sleep(1500);
      const pending = pendingLazyContainers(document);
      console.log(`onLoad pass ${pass + 1}: ${pending} lazy container(s) still empty`);
      if (!pending) break;
    }
    // Product carousels and series cards hydrate only while centred in view:
    // product images, final prices and the series card links arrive late.
    const hydrated = (el) => {
      const cards = [...el.querySelectorAll('.product_card')];
      const cardsOk = cards.every((card) => card.querySelector('.normal_image img[src], .img_box img[src]')
        && card.querySelector('.final_price'));
      const linksOk = [...el.querySelectorAll('a.segment-spot-card-action')].every((a) => a.getAttribute('href'));
      return cardsOk && linksOk;
    };
    const targets = [...document.querySelectorAll('.SplitterProductCarousel, .x-cms-ofp-fe-2c-widgets-segmentespots')];
    for (const el of targets) {
      el.scrollIntoView({ block: 'center' });
      for (let waited = 0; waited < 6000 && !hydrated(el); waited += 300) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(300);
      }
      console.log(`onLoad hydrate ${el.className.split(' ')[0]}: ${hydrated(el) ? 'ready' : 'TIMED OUT'}`);
    }
    // The importer drops empty <a> elements before parsing; the series cards'
    // only link is an empty overlay anchor, so give it its own aria-label as text.
    document.querySelectorAll('a.segment-spot-card-action[href]').forEach((a) => {
      if (!a.textContent.trim()) a.textContent = a.getAttribute('aria-label') || 'Shop Now';
    });
    win.scrollTo(0, 0);
    await sleep(500);
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + Section Metadata
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules (page Metadata from title / description / og:image)
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: the source path without the trailing slash
    //    (https://www.lenovo.com/us/en/c/laptops/thinkpad/ -> /us/en/c/laptops/thinkpad)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
