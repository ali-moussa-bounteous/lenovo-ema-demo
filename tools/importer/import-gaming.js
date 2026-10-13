/* eslint-disable */
/* global WebImporter */

// Import script for template "gaming" (Lenovo US gaming resources page).
// The source URL ends with a slash; the document is written to /us/en/gaming.

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsTopicParser from './parsers/cards-topic.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsLinksParser from './parsers/columns-links.js';
import carouselCardsParser from './parsers/carousel-cards.js';

// TRANSFORMER IMPORTS (gaming-specific; the homepage keeps lenovo-cleanup/lenovo-sections)
import lenovoGamingCleanupTransformer from './transformers/lenovo-gaming-cleanup.js';
import lenovoGamingSectionsTransformer from './transformers/lenovo-gaming-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "gaming",
  "urls": [
    "https://www.lenovo.com/us/en/gaming/"
  ],
  "representativeUrl": "https://www.lenovo.com/us/en/gaming/",
  "description": "Lenovo gaming landing page (/us/en/gaming/)",
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".resources-hero-image"
      ]
    },
    {
      "name": "cards-topic",
      "instances": [
        ".left-img-right-txt"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        ".edu-right-box-bg-img"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".widgets_merchandising_reel_pc_container .product"
      ]
    },
    {
      "name": "columns-links",
      "instances": [
        ".shop-links-ul"
      ]
    },
    {
      "name": "carousel-cards",
      "instances": [
        "section.carousel-espot"
      ]
    }
  ],
  "urlPattern": "/us/en/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Breadcrumb + resources hero banner",
      "selector": [
        "main.main_content > div:has(.resources-hero-image)",
        ".resources-hero-image"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": [
        ".breadcrumb-links"
      ]
    },
    {
      "id": "section-2",
      "name": "Explore Gaming Topics + sidebar (deals, recommended products)",
      "selector": [
        "main.main_content > div:has(.left-img-right-txt)"
      ],
      "style": "sidebar",
      "blocks": [
        "cards-topic",
        "cards-promo",
        "cards-product"
      ],
      "defaultContent": [
        ".drop-down-bdr .head_left_text",
        ".recommended_head"
      ]
    },
    {
      "id": "section-3",
      "name": "Shop / Explore link panels",
      "selector": [
        "main.main_content > div:has(.shop-links-ul)"
      ],
      "style": null,
      "blocks": [
        "columns-links"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Why Lenovo Gaming? title band",
      "selector": [
        ".gaminghp_common_title_wrap"
      ],
      "style": "title-band",
      "blocks": [],
      "defaultContent": [
        ".gaminghp_common_title_wrap h2"
      ]
    },
    {
      "id": "section-5",
      "name": "Why Lenovo Gaming? card carousel",
      "selector": [
        "section.carousel-espot"
      ],
      "style": null,
      "blocks": [
        "carousel-cards"
      ],
      "defaultContent": []
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-topic': cardsTopicParser,
  'cards-promo': cardsPromoParser,
  'cards-product': cardsProductParser,
  'columns-links': columnsLinksParser,
  'carousel-cards': carouselCardsParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks / section metadata
const transformers = [
  lenovoGamingCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [lenovoGamingSectionsTransformer] : []),
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
      const elements = document.querySelectorAll(selector);
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (sibling matches of one block are consumed by its first
    //    match and detached, so skip detached elements)
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

    // 4. Final cleanup, page Metadata (Title, Description, Image, Theme: dark)
    //    and Section Metadata
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules. No createMetadata here: the cleanup transformer has
    //    already added the page Metadata block.
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: mirror the source path without the trailing slash
    const path = WebImporter.FileUtils.sanitizePath('/us/en/gaming');

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
