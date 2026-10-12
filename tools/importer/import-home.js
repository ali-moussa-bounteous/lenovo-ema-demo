/* eslint-disable */
/* global WebImporter */

// Import script for template "home" (Lenovo US homepage).
// The Lenovo homepage replaces the site homepage, so every URL of this
// template is written to /index.

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCategoryParser from './parsers/cards-category.js';
import tabsPromptParser from './parsers/tabs-prompt.js';
import cardsTileParser from './parsers/cards-tile.js';
import cardsIconParser from './parsers/cards-icon.js';
import columnsRewardsParser from './parsers/columns-rewards.js';
import tabsCasestudyParser from './parsers/tabs-casestudy.js';

// TRANSFORMER IMPORTS
import lenovoCleanupTransformer from './transformers/lenovo-cleanup.js';
import lenovoSectionsTransformer from './transformers/lenovo-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.lenovo.com/us/en/"
  ],
  "representativeUrl": "https://www.lenovo.com/us/en/",
  "description": "",
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".carousel.panelcontainer"
      ]
    },
    {
      "name": "cards-category",
      "instances": [
        ".card-grid.categories"
      ]
    },
    {
      "name": "tabs-prompt",
      "instances": [
        ".len-prompt-container"
      ]
    },
    {
      "name": "cards-tile",
      "instances": [
        ".card-grid.detail .card-grid__wrapper"
      ]
    },
    {
      "name": "cards-icon",
      "instances": [
        ".card-grid.icon .card-grid__wrapper"
      ]
    },
    {
      "name": "columns-rewards",
      "instances": [
        ".content-package-banner"
      ]
    },
    {
      "name": "tabs-casestudy",
      "instances": [
        ".len-tabs"
      ]
    }
  ],
  "urlPattern": "/us/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Hero carousel",
      "selector": [
        ".cmp-experiencefragment--ftv-hero-banner-carousel",
        ".experiencefragment:has(.cmp-carousel)"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Category shortcuts",
      "selector": [
        ".len-card-grid:has(.card-grid.categories)",
        ".len-card-grid.section:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "cards-category"
      ],
      "defaultContent": []
    },
    {
      "id": "section-3",
      "name": "Discover How Lenovo Can Help You (prompt picker)",
      "selector": [
        ".prompt-group.base-component",
        ".prompt-group"
      ],
      "style": null,
      "blocks": [
        "tabs-prompt"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Powering Global Events & Partnerships",
      "selector": [
        ".len-card-grid:has(.card-grid.detail):nth-of-type(5)",
        ".len-card-grid.section:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [
        "cards-tile"
      ],
      "defaultContent": [
        ".len-card-grid.section:nth-of-type(5) .card-grid__section-header .cmp-title__text",
        ".len-card-grid.section:nth-of-type(5) .card-grid__section-header .cmp-title__description"
      ]
    },
    {
      "id": "section-5",
      "name": "A Global Technology Powerhouse",
      "selector": [
        ".len-card-grid:has(.card-grid.icon):nth-of-type(7)",
        ".len-card-grid.section:nth-of-type(7)"
      ],
      "style": null,
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": [
        ".len-card-grid.section:nth-of-type(7) .card-grid__section-header .cmp-title__text"
      ]
    },
    {
      "id": "section-6",
      "name": "Fueling What's Next",
      "selector": [
        ".len-card-grid:has(.card-grid.detail):nth-of-type(9)",
        ".len-card-grid.section:nth-of-type(9)"
      ],
      "style": null,
      "blocks": [
        "cards-tile"
      ],
      "defaultContent": [
        ".len-card-grid.section:nth-of-type(9) .card-grid__section-header .cmp-title__text",
        ".len-card-grid.section:nth-of-type(9) .card-grid__section-header .cmp-title__description"
      ]
    },
    {
      "id": "section-7",
      "name": "Browse Devices Built to Help You Go Further",
      "selector": [
        ".len-card-grid:has(.card-grid.detail):nth-of-type(11)",
        ".len-card-grid.section:nth-of-type(11)"
      ],
      "style": null,
      "blocks": [
        "cards-tile"
      ],
      "defaultContent": [
        ".len-card-grid.section:nth-of-type(11) .card-grid__section-header .cmp-title__text"
      ]
    },
    {
      "id": "section-8",
      "name": "My Lenovo Rewards banner",
      "selector": [
        ".len-acb.section",
        ".len-acb"
      ],
      "style": null,
      "blocks": [
        "columns-rewards"
      ],
      "defaultContent": []
    },
    {
      "id": "section-9",
      "name": "Exclusive Promotions & Resources",
      "selector": [
        ".len-card-grid:has(.card-grid.icon):nth-of-type(15)",
        ".len-card-grid.section:nth-of-type(15)"
      ],
      "style": null,
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": [
        ".len-card-grid.section:nth-of-type(15) .card-grid__section-header .cmp-title__text",
        ".len-card-grid.section:nth-of-type(15) .card-grid__section-header .cmp-title__description"
      ]
    },
    {
      "id": "section-10",
      "name": "Lenovo Innovation in Action",
      "selector": [
        ".section-header.base-component",
        ".tabs.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "tabs-casestudy"
      ],
      "defaultContent": [
        ".section-header .cmp-title__text",
        ".section-header .cmp-title__body-wrapper a"
      ]
    }
  ]
};

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-category': cardsCategoryParser,
  'tabs-prompt': tabsPromptParser,
  'cards-tile': cardsTileParser,
  'cards-icon': cardsIconParser,
  'columns-rewards': columnsRewardsParser,
  'tabs-casestudy': tabsCasestudyParser,
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks
const transformers = [
  lenovoCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [lenovoSectionsTransformer] : []),
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

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (skip elements detached by an earlier parser)
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

    // 4. Final cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: the Lenovo homepage replaces the site homepage
    const path = WebImporter.FileUtils.sanitizePath('/index');

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
