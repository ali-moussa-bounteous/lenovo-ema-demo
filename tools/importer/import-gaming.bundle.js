/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-gaming.js
  var import_gaming_exports = {};
  __export(import_gaming_exports, {
    default: () => import_gaming_default
  });

  // tools/importer/parsers/hero-banner.js
  var URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/i;
  function read(val) {
    const m = (val || "").match(URL_RE);
    return m ? m[1] : "";
  }
  function styleSheetUrl(el, document2) {
    const classes = [...el.classList];
    if (!classes.length) return "";
    for (const style of document2.querySelectorAll("style")) {
      const css = style.textContent || "";
      const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
      let m;
      while (m = ruleRe.exec(css)) {
        const selectors = m[1].split(",").map((s) => s.trim());
        const hit = selectors.some((s) => classes.some((c) => new RegExp(`\\.${c}$`).test(s)));
        if (hit && /background(-image)?\s*:/i.test(m[2])) {
          const src = read(m[2]);
          if (src) return src;
        }
      }
    }
    return "";
  }
  function backgroundUrl(el, document2) {
    let src = read(el.getAttribute("style"));
    if (!src) src = styleSheetUrl(el, document2);
    if (!src && typeof window !== "undefined" && window.getComputedStyle) {
      try {
        src = read(window.getComputedStyle(el).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) return "";
    try {
      return new URL(src, "https://www.lenovo.com/").href;
    } catch (e) {
      return src;
    }
  }
  function parse(element, { document: document2 }) {
    const textWrap = element.querySelector(".resource-herowht-txt") || element;
    let img = element.querySelector(":scope > img, :scope > picture img");
    if (!img) {
      img = [...element.querySelectorAll("img")].find((i) => textWrap === element || !textWrap.contains(i)) || null;
    }
    if (!img) {
      const src = backgroundUrl(element, document2);
      if (src) {
        img = document2.createElement("img");
        img.src = src;
        img.alt = "";
      }
    }
    const headingEl = textWrap.querySelector("h1, h2, h3, h4, h5, h6");
    const paragraphs = [...textWrap.querySelectorAll("p")].filter((p) => p.textContent.trim());
    if (!img && !headingEl && !paragraphs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (img) cells.push([img]);
    const content = [];
    if (headingEl) {
      const h1 = document2.createElement("h1");
      h1.textContent = headingEl.textContent.trim();
      content.push(h1);
    }
    content.push(...paragraphs);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-topic.js
  var ITEM_CLASS = "left-img-right-txt";
  function collectGroup(element) {
    const parent = element.parentElement;
    if (!parent) return [element];
    const group = [...parent.children].filter((c) => c.classList.contains(ITEM_CLASS));
    return group.length ? group : [element];
  }
  function buildRow(item, document2) {
    const img = item.querySelector(".image-left-resources img, picture img, img");
    const text = item.querySelector(".text-right-resources") || item;
    const headingEl = text.querySelector("h1, h2, h3, h4, h5, h6");
    const headingLink = headingEl ? headingEl.querySelector("a[href]") : null;
    const title = headingEl ? headingEl.textContent.trim() : "";
    const descriptions = [...text.querySelectorAll("p")].filter((p) => p.textContent.trim() && !(headingEl && headingEl.contains(p)));
    const ctas = [...text.querySelectorAll("a[href]")].filter((a) => !(headingEl && headingEl.contains(a)) && a.textContent.trim()).filter((a) => !descriptions.some((p) => p.contains(a) && p.textContent.trim() !== a.textContent.trim()));
    if (!img && !title && !descriptions.length) return null;
    const body = [];
    if (title) {
      const h3 = document2.createElement("h3");
      if (headingLink) {
        const a = document2.createElement("a");
        a.href = headingLink.getAttribute("href");
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }
    descriptions.filter((p) => !ctas.some((a) => p.contains(a))).forEach((p) => {
      const np = document2.createElement("p");
      np.textContent = p.textContent.trim();
      body.push(np);
    });
    ctas.forEach((cta) => {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = cta.textContent.trim();
      const bold = cta.closest("strong, b") || cta.querySelector("strong, b");
      if (bold) {
        const strong = document2.createElement("strong");
        strong.append(a);
        p.append(strong);
      } else {
        p.append(a);
      }
      body.push(p);
    });
    return [img || "", body];
  }
  function parse2(element, { document: document2 }) {
    const group = collectGroup(element);
    const cells = [];
    group.forEach((item) => {
      const row = buildRow(item, document2);
      if (row) cells.push(row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    group.forEach((item) => {
      if (item !== element) item.remove();
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-topic", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  var ITEM_CLASS2 = "edu-right-box-bg-img";
  function collectGroup2(element) {
    const parent = element.parentElement;
    if (!parent) return [element];
    const group = [...parent.children].filter((c) => c.classList.contains(ITEM_CLASS2));
    return group.length ? group : [element];
  }
  function buildCell(box, document2) {
    const titleEl = box.querySelector(".edu-font-bold-big-black") || box.querySelector("h1, h2, h3, h4, h5, h6");
    let textEls = [...box.querySelectorAll(".edu-font-normal-big-black")];
    if (!textEls.length) {
      textEls = [...box.querySelectorAll("p")].filter((p) => !p.closest(".cta-wrapper"));
    }
    const ctaWrap = box.querySelector(".cta-wrapper");
    let ctas = ctaWrap ? [...ctaWrap.querySelectorAll("a[href]")] : [];
    if (!ctas.length) ctas = [...box.querySelectorAll("a[href]")];
    const title = titleEl ? titleEl.textContent.trim() : "";
    const texts = textEls.map((t) => t.textContent.trim()).filter(Boolean);
    if (!title && !texts.length && !ctas.length) return null;
    const cell = [];
    if (title) {
      const h3 = document2.createElement("h3");
      h3.textContent = title;
      cell.push(h3);
    }
    texts.forEach((t) => {
      const p = document2.createElement("p");
      p.textContent = t;
      cell.push(p);
    });
    ctas.forEach((cta) => {
      const label = cta.textContent.trim();
      if (!label) return;
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = label;
      p.append(a);
      cell.push(p);
    });
    return cell;
  }
  function parse3(element, { document: document2 }) {
    const boxes = collectGroup2(element);
    const cells = [];
    boxes.forEach((box) => {
      const cell = buildCell(box, document2);
      if (cell) cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    boxes.forEach((box) => {
      if (box !== element) box.remove();
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  var URL_RE2 = /url\(\s*["']?([^"')]+)["']?\s*\)/i;
  function absolute(url) {
    if (!url) return "";
    try {
      return new URL(url, "https://www.lenovo.com/").href;
    } catch (e) {
      return url;
    }
  }
  function decode(val) {
    if (!val) return "";
    try {
      return decodeURIComponent(val).trim();
    } catch (e) {
      return val.trim();
    }
  }
  function collectGroup3(element) {
    const reel = element.closest(".widgets_merchandising_reel_pc_container");
    if (!reel) return [element];
    const group = [...reel.querySelectorAll(".product")];
    return group.length ? group : [element];
  }
  function buildRow2(product, document2) {
    const nameEl = product.querySelector(".text_container .name, .name");
    const name = nameEl && nameEl.textContent.trim() || decode(product.getAttribute("data-summary"));
    const nameLink = nameEl && nameEl.closest("a[href]") || product.querySelector(".text_container a[href]:not(.more)");
    const href = nameLink && nameLink.getAttribute("href") || product.getAttribute("data-link-url") || "";
    const priceEl = product.querySelector(".price_container .price, .price");
    const price = priceEl && priceEl.textContent.trim() || (product.getAttribute("data-price") || "").trim();
    let img = product.querySelector(".img_container img, img");
    if (!img) {
      const bgEl = product.querySelector(".img_container .img, .img");
      const m = bgEl ? (bgEl.getAttribute("style") || "").match(URL_RE2) : null;
      const src = absolute(m && m[1] || product.getAttribute("data-img-url"));
      if (src) {
        img = document2.createElement("img");
        img.src = src;
      }
    }
    if (img && !img.getAttribute("alt") && name) img.setAttribute("alt", name);
    if (!name && !img) return null;
    const body = [];
    if (name) {
      const p = document2.createElement("p");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      body.push(p);
    }
    if (price) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      strong.textContent = price;
      p.append(strong);
      body.push(p);
    }
    return { key: href || name, row: [img || "", body] };
  }
  function parse4(element, { document: document2 }) {
    const products = collectGroup3(element);
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    products.forEach((product) => {
      const item = buildRow2(product, document2);
      if (!item || seen.has(item.key)) return;
      seen.add(item.key);
      cells.push(item.row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    products.forEach((product) => {
      if (product === element) return;
      const slide = product.parentElement && product.parentElement.matches("a.swiper-slide") && product.parentElement.children.length === 1 ? product.parentElement : null;
      product.remove();
      if (slide) slide.remove();
    });
    const slideAnchor = element.parentElement && element.parentElement.closest("a");
    if (slideAnchor && slideAnchor.parentElement) {
      slideAnchor.before(element);
      slideAnchor.remove();
    }
    const list = element.parentElement;
    if (list) {
      list.querySelectorAll(":scope > a.swiper-slide").forEach((a) => {
        if (!a.textContent.trim() && !a.querySelector("img")) a.remove();
      });
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-links.js
  var PANEL_SELECTOR = ".shop-links-ul";
  var MAX_DEPTH = 8;
  function collectGroup4(element) {
    let ancestor = element.parentElement;
    for (let depth = 0; ancestor && depth < MAX_DEPTH; depth += 1) {
      if (ancestor.matches("main, body")) break;
      const panels = [...ancestor.querySelectorAll(PANEL_SELECTOR)].filter((p) => !p.parentElement.closest(PANEL_SELECTOR));
      if (panels.length > 1) return panels;
      ancestor = ancestor.parentElement;
    }
    return [element];
  }
  function buildCell2(panel, document2) {
    const headingEl = panel.querySelector("h1, h2, h3, h4, h5, h6");
    const links = [...panel.querySelectorAll("li a[href]")].filter((a) => a.textContent.trim());
    if (!links.length) {
      links.push(...[...panel.querySelectorAll("a[href]")].filter((a) => a.textContent.trim()));
    }
    const img = panel.querySelector(".image-right-middle img, figure img, picture img, img");
    if (!headingEl && !links.length && !img) return null;
    const cell = [];
    if (headingEl && headingEl.textContent.trim()) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingEl.textContent.trim();
      cell.push(h2);
    }
    if (links.length) {
      const ul = document2.createElement("ul");
      links.forEach((link) => {
        const li = document2.createElement("li");
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim();
        li.append(a);
        ul.append(li);
      });
      cell.push(ul);
    }
    if (img) cell.push(img);
    return cell;
  }
  function parse5(element, { document: document2 }) {
    const panels = collectGroup4(element);
    const row = [];
    panels.forEach((panel) => {
      const cell = buildCell2(panel, document2);
      if (cell) row.push(cell);
    });
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    panels.forEach((panel) => {
      if (panel !== element) panel.remove();
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-cards.js
  function parse6(element, { document: document2 }) {
    const cells = [];
    const bandBg = element.querySelector(".carousel-espot__bg img, img.carousel-espot__bg-image");
    if (bandBg) cells.push([bandBg, ""]);
    let slides = [...element.querySelectorAll("article.carousel-espot__slide")];
    if (!slides.length) slides = [...element.querySelectorAll(".carousel-espot__slide, .swiper-slide")];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      if (slide.classList.contains("swiper-slide-duplicate")) return;
      const headlineEl = slide.querySelector(".carousel-espot__headline") || slide.querySelector("h1, h2, h3, h4, h5, h6");
      const descEl = slide.querySelector(".carousel-espot__description") || slide.querySelector(".carousel-espot__content-layout p, p");
      const ctaEl = slide.querySelector("a.carousel-espot__cta[href]") || slide.querySelector(".carousel-espot__overlay a[href], a[href]");
      const headline = headlineEl ? headlineEl.textContent.trim() : "";
      const desc = descEl ? descEl.textContent.trim() : "";
      const href = ctaEl ? ctaEl.getAttribute("href") : "";
      const key = `${headline}|${href}`;
      if (!headline && !desc && !href) return;
      if (seen.has(key)) return;
      seen.add(key);
      const media = [];
      const bgArt = slide.querySelector(".carousel-espot__media img, picture img.carousel-espot__image, img.carousel-espot__image");
      const character = slide.querySelector("img.carousel-espot__hover-image");
      if (bgArt) media.push(bgArt);
      if (character && character !== bgArt) media.push(character);
      const content = [];
      if (headline) {
        const h3 = document2.createElement("h3");
        h3.textContent = headline;
        content.push(h3);
      }
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = ctaEl.textContent.trim() || "Learn More";
        p.append(a);
        content.push(p);
      }
      cells.push([media.length ? media : "", content]);
    });
    if (cells.length === 0 || cells.length === 1 && bandBg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lenovo-gaming-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SEO_TEST_TEXT = "\u6D4B\u8BD5\u6587\u672C";
  function renameTag(el, tagName) {
    if (!el || el.tagName.toLowerCase() === tagName) return el;
    const doc = el.ownerDocument;
    const replacement = doc.createElement(tagName);
    [...el.attributes].forEach((attr) => replacement.setAttribute(attr.name, attr.value));
    while (el.firstChild) replacement.appendChild(el.firstChild);
    el.replaceWith(replacement);
    return replacement;
  }
  function removeFragmentAround(element, chromeSelector) {
    element.querySelectorAll(chromeSelector).forEach((chrome) => {
      const fragment = chrome.closest('[id="$_fragment_uuid"]');
      const target = fragment && !fragment.querySelector("main, .resources-hero-image, .left-img-right-txt, .shop-links-ul, .gaminghp_common_title_wrap, section.carousel-espot") ? fragment : chrome;
      target.remove();
    });
  }
  function isBlank(el) {
    return !el.textContent.replace(/ /g, " ").trim() && !el.querySelector("img, picture, video, iframe, a, svg");
  }
  function metaContent(doc, selectors) {
    for (const sel of selectors) {
      const m = doc.querySelector(sel);
      if (m && m.getAttribute("content")) return m.getAttribute("content").trim();
    }
    return "";
  }
  function findMetadataTable(element) {
    return [...element.querySelectorAll("table")].find((table) => {
      const firstCell = table.querySelector("tr > th, tr > td");
      return firstCell && firstCell.textContent.trim().toLowerCase() === "metadata";
    });
  }
  function addPageMetadata(element) {
    const doc = element.ownerDocument;
    const existing = findMetadataTable(element);
    if (existing) {
      const hasTheme = [...existing.querySelectorAll("tr > td:first-child")].some((td) => td.textContent.trim().toLowerCase() === "theme");
      if (!hasTheme) {
        const tr = doc.createElement("tr");
        const k = doc.createElement("td");
        const v = doc.createElement("td");
        k.textContent = "Theme";
        v.textContent = "dark";
        tr.append(k, v);
        existing.querySelector("tbody, table").append(tr);
      }
      return;
    }
    const meta = {};
    const titleEl = doc.querySelector("head > title, title");
    const title = titleEl && titleEl.textContent.replace(/[\n\t]/gm, "").trim() || metaContent(doc, ['meta[property="og:title"]']);
    if (title) meta.Title = title;
    const description = metaContent(doc, ['meta[property="og:description"]', 'meta[name="description"]']);
    if (description) meta.Description = description;
    const ogImage = metaContent(doc, ['meta[property="og:image"]']);
    if (ogImage) {
      const img = doc.createElement("img");
      img.src = ogImage;
      meta.Image = img;
    }
    meta.Theme = "dark";
    const block = WebImporter.Blocks.getMetadataBlock ? WebImporter.Blocks.getMetadataBlock(doc, meta) : WebImporter.Blocks.createBlock(doc, { name: "Metadata", cells: meta });
    element.append(block);
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      removeFragmentAround(element, "nav.commonHeader");
      removeFragmentAround(element, "footer.commonFooter");
      WebImporter.DOMUtils.remove(element, [
        ".commonHeaderPlaceHolder",
        "nav.commonHeader",
        "section.x-cms-merchandizingbanner",
        "footer.commonFooter",
        ".fragment-placeholder",
        // loading shimmer <img alt="shine"> in the header fragment
        ".page_config_info"
        // CMS tooling (tooltip/highlight/fps toggles)
      ]);
      element.querySelectorAll(":scope > h1, :scope > h2, :scope > h3").forEach((h) => h.remove());
      element.querySelectorAll(":scope > span").forEach((span) => {
        if (span.textContent.trim() === SEO_TEST_TEXT) span.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        "#INDWrap",
        // accessibility toolbar (INDmenu-btn, INDpopup, INDquickAccess)
        "#_evidon_banner",
        // cookie consent banner
        "#inside_holder",
        // live chat tab (inside_liveChatTab)
        ".bottomStickyDock",
        // back-to-top, compare dock, feedback, "Need Help? Call", chat now
        "#lenovoSurveyWidget",
        // floating "Feedback" survey launcher
        ".Q27443ExpBwpc-popup",
        // product-recommendation popup overlapping the hero
        "#proCommunity",
        // Lenovo Pro terms popup
        ".sheer-id-popup",
        // sign-in / SheerID success modal
        ".sheerIDsuccess",
        ".rbkey_content_none",
        // hidden i18n strings for the modals
        "#globalSnackBar",
        "#snackbar",
        "#timerLoggedOut",
        ".public-store-alert",
        "#store-alert-pc",
        "#test"
        // empty div#test
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".sr-only",
        // merchandizing carousel status, email dialog labels
        ".carousel-espot__sr",
        // "Carousel switched to slide 1 of 5 ..."
        ".carousel-espot__sr-text",
        // "Previous/Next carousel arrow"
        ".swiper-notification",
        ".INDhiddenText"
      ]);
      WebImporter.DOMUtils.remove(element, [".edu-breadcrumb-links"]);
      WebImporter.DOMUtils.remove(element, [".drop-down-bdr .text_normal_right", "select#FindArticles"]);
      element.querySelectorAll(".float-left-both").forEach((el) => {
        if (isBlank(el)) el.remove();
      });
      element.querySelectorAll(".shop-links-ul li").forEach((li) => {
        if (isBlank(li)) li.remove();
      });
      WebImporter.DOMUtils.remove(element, [".widgets_merchandising_reel_pc_container .product a.more"]);
      WebImporter.DOMUtils.remove(element, [".gaminghp_common_title_wrap .down-arrow", ".carousel-espot__chevron"]);
      element.querySelectorAll(".resources-hero-image .resource-herowht-txt h2").forEach((h) => renameTag(h, "h1"));
      element.querySelectorAll(".drop-down-bdr .head_left_text h3:not(.heading-three-img)").forEach((h) => renameTag(h, "h2"));
      element.querySelectorAll(".left-img-right-txt .text-right-resources h4").forEach((h) => renameTag(h, "h3"));
      element.querySelectorAll(".edu-right-box-bg-img .edu-font-bold-big-black").forEach((h) => renameTag(h, "h3"));
      element.querySelectorAll(".widgets_merchandising_reel_pc_container h4.recommended_head").forEach((h) => renameTag(h, "h3"));
      element.querySelectorAll(".shop-links-ul h5").forEach((h) => renameTag(h, "h2"));
      element.querySelectorAll("section.carousel-espot h2.carousel-espot__headline").forEach((h) => renameTag(h, "h3"));
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[id^="batBeacon"]',
        // bing UET beacon div + imgs
        'img[src*="bat.bing.com"]',
        "iframe"
        // qualaroo, doubleclick floodlight, IND props, empty frames; no authorable iframes
      ]);
      WebImporter.DOMUtils.remove(element, ["link", "noscript", "script", "style", "meta", "select", "button:empty"]);
      element.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        if (isBlank(h)) h.remove();
      });
      element.querySelectorAll("[data-track], [onclick]").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
      });
      addPageMetadata(element);
    }
  }

  // tools/importer/transformers/lenovo-gaming-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-gaming.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-banner": parse,
    "cards-topic": parse2,
    "cards-promo": parse3,
    "cards-product": parse4,
    "columns-links": parse5,
    "carousel-cards": parse6
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_gaming_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath("/us/en/gaming");
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_gaming_exports);
})();
