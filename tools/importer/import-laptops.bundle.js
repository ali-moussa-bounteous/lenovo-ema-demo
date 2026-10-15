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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-laptops.js
  var import_laptops_exports = {};
  __export(import_laptops_exports, {
    default: () => import_laptops_default
  });

  // tools/importer/parsers/hero-brand.js
  function slug(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
  }
  function parse(element, { document: document2 }) {
    const bgImg = element.querySelector("img.heroBgImage") || element.querySelector("article picture img");
    const logoImg = element.querySelector(".heroLogo img");
    const titleWrap = element.querySelector(".heroTitle .desktopOnly") || element.querySelector(".heroTitle") || element;
    const srcHeading = titleWrap.querySelector("h1, h2, h3, h4, h5, h6");
    const ctas = [...element.querySelectorAll(".heroCta a[href]")];
    if (!bgImg && !srcHeading && !ctas.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImg) cells.push([bgImg]);
    const content = [];
    if (logoImg) {
      const src = logoImg.getAttribute("src") || "";
      if (/\.svg$/i.test(src)) logoImg.setAttribute("src", `${src}?icon`);
      const p = document2.createElement("p");
      p.append(logoImg);
      content.push(p);
    }
    if (srcHeading) {
      const h1 = document2.createElement("h1");
      const spans = [...srcHeading.querySelectorAll(":scope > span")].filter((s) => s.textContent.trim());
      if (spans.length > 1) {
        spans.forEach((span, i) => {
          const text = span.textContent.trim();
          if (i > 0) h1.append(document2.createTextNode(" "));
          if (i === spans.length - 1) {
            const em = document2.createElement("em");
            em.textContent = text;
            h1.append(em);
          } else {
            h1.append(document2.createTextNode(text));
          }
        });
      } else {
        h1.textContent = srcHeading.textContent.replace(/\s+/g, " ").trim();
      }
      content.push(h1);
    }
    const seen = /* @__PURE__ */ new Set();
    ctas.forEach((a) => {
      let href = a.getAttribute("href");
      if (href.startsWith("#") && href.length > 1) {
        let target = null;
        try {
          target = document2.getElementById(decodeURIComponent(href.slice(1)));
        } catch (e) {
        }
        if (target && /^H[1-6]$/.test(target.tagName) && target.textContent.trim()) {
          href = `#${slug(target.textContent)}`;
        }
      }
      const text = a.textContent.replace(/\s+/g, " ").trim();
      if (!text || seen.has(href)) return;
      seen.add(href);
      const p = document2.createElement("p");
      const link2 = document2.createElement("a");
      link2.href = href;
      link2.textContent = text;
      p.append(link2);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-brand", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/anchor-nav-sticky.js
  var EXCLUDED_LABELS = ["reviews"];
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function slug2(text) {
    return clean(text).toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
  }
  function words(text) {
    return clean(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 2);
  }
  function nextHeading(marker, document2) {
    const scope = marker.closest("main") || document2.body;
    const walker = document2.createTreeWalker(
      scope,
      1
      /* SHOW_ELEMENT */
    );
    walker.currentNode = marker;
    let node = walker.nextNode();
    while (node) {
      if (node.hasAttribute("anchor-name")) return null;
      if (/^H[1-3]$/.test(node.tagName) && clean(node.textContent)) return node;
      node = walker.nextNode();
    }
    return null;
  }
  function sectionHeadlines(document2, nav) {
    const list = [];
    document2.querySelectorAll(".dx-big-section-headline").forEach((el) => {
      const heading = el.closest("h1, h2, h3") || el;
      if (nav.contains(heading) || !clean(heading.textContent)) return;
      if (!/^H[1-3]$/.test(heading.tagName)) return;
      if (!list.includes(heading)) list.push(heading);
    });
    return list;
  }
  function parse2(element, { document: document2 }) {
    const buttons = [...element.querySelectorAll(".anchor_nav__text, [data-anchorname]")].filter((b, i, all) => all.indexOf(b) === i && clean(b.textContent));
    const items = buttons.map((b) => ({ label: clean(b.textContent), name: b.getAttribute("data-anchorname") || "" }));
    const headlines = sectionHeadlines(document2, element);
    const main = element.closest("main") || document2.body;
    const allHeadings = [...main.querySelectorAll("h1, h2, h3")].filter((h) => !element.contains(h) && clean(h.textContent));
    const resolve = (item, index) => {
      if (item.name) {
        const marker = [...document2.querySelectorAll("[anchor-name]")].find((m) => m.getAttribute("anchor-name") === item.name);
        if (marker) {
          const h = nextHeading(marker, document2);
          if (h) return h;
        }
      }
      if (headlines.length === items.length) return headlines[index];
      const labelWords = words(item.label);
      if (!labelWords.length) return null;
      return allHeadings.find((h) => {
        const hw = words(h.textContent);
        return labelWords.every((w) => hw.includes(w));
      }) || null;
    };
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item, index) => {
      if (EXCLUDED_LABELS.includes(item.label.toLowerCase())) return;
      const heading = resolve(item, index);
      if (!heading || EXCLUDED_LABELS.includes(clean(heading.textContent).toLowerCase())) return;
      const id = slug2(heading.textContent);
      if (!id || seen.has(id)) return;
      seen.add(id);
      const a = document2.createElement("a");
      a.href = `#${id}`;
      a.textContent = item.label;
      cells.push([a]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "anchor-nav-sticky", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  var YT_ID_RE = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/i;
  function videoIdFrom(element) {
    const candidates = [];
    element.querySelectorAll("iframe").forEach((f) => {
      candidates.push(f.getAttribute("src"), f.getAttribute("data-src"));
    });
    [element, ...element.querySelectorAll("*")].forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (/^data-/.test(attr.name)) candidates.push(attr.value);
      });
    });
    element.querySelectorAll("a[href]").forEach((a) => candidates.push(a.getAttribute("href")));
    for (const c of candidates) {
      const m = (c || "").match(YT_ID_RE);
      if (m) return m[1];
    }
    const idEl = element.querySelector("[data-video-id], [data-videoid], [data-yt-id]") || (element.matches("[data-video-id], [data-videoid], [data-yt-id]") ? element : null);
    if (idEl) {
      const id = idEl.getAttribute("data-video-id") || idEl.getAttribute("data-videoid") || idEl.getAttribute("data-yt-id");
      if (/^[\w-]{6,}$/.test(id || "")) return id;
    }
    return "";
  }
  function parse3(element, { document: document2 }) {
    const id = videoIdFrom(element);
    if (!id) {
      return;
    }
    const poster = element.querySelector(":scope > img, :scope > picture img") || [...element.querySelectorAll("img")].find((i) => !i.closest(".dx-thinkpad-yt-video-play"));
    if (poster && /^video thumbnail$/i.test((poster.getAttribute("alt") || "").trim())) {
      poster.setAttribute("alt", "");
    }
    const url = `https://www.youtube.com/watch?v=${id}`;
    const link2 = document2.createElement("a");
    link2.href = url;
    link2.textContent = url;
    const content = [];
    if (poster) {
      const p = document2.createElement("p");
      p.append(poster);
      content.push(p);
    }
    const linkP = document2.createElement("p");
    linkP.append(link2);
    content.push(linkP);
    const cells = [[content]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-reveal.js
  function keepSvg(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?icon`);
    return img;
  }
  function clean2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll("section.student-espot")];
    if (!tiles.length) tiles = [...element.querySelectorAll('[class*="espot_inner_container"]')];
    const cells = [];
    tiles.forEach((tile) => {
      const photo = tile.querySelector("img.student-espot__image") || tile.querySelector(".student-espot__media img");
      const icon = tile.querySelector("img.student-espot__icon") || tile.querySelector(".student-espot__icon-wrap img");
      const headline = tile.querySelector(".student-espot__headline, h1, h2, h3, h4");
      const descs = [...tile.querySelectorAll(".student-espot__description")].filter((d) => clean2(d.textContent));
      if (!photo && !headline) return;
      const body = [];
      if (icon) {
        keepSvg(icon);
        if (!clean2(icon.getAttribute("alt"))) icon.setAttribute("alt", "");
        const p = document2.createElement("p");
        p.append(icon);
        body.push(p);
      }
      if (headline) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean2(headline.textContent);
        body.push(h3);
      }
      descs.forEach((d) => {
        const p = document2.createElement("p");
        p.innerHTML = d.innerHTML.trim();
        body.push(p);
      });
      cells.push([photo || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-reveal", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-spotlight.js
  function clean3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function productCode(card) {
    const idEl = card.querySelector(".product_title [id], .product_name [id]");
    if (idEl && /^[a-z0-9]{6,}$/i.test(idEl.id)) return idEl.id;
    const m = (card.className || "").match(/product_card_([A-Z0-9]{6,})/i);
    return m ? m[1] : "";
  }
  function productHref(card, document2) {
    const own = card.querySelector('a[href]:not([href^="#"]):not([href^="javascript"])');
    if (own) return own.getAttribute("href");
    const dataHref = card.getAttribute("data-href") || card.getAttribute("data-url") || (card.querySelector("[data-href], [data-url]") || { getAttribute: () => "" }).getAttribute("data-href");
    if (dataHref) return dataHref;
    const code = productCode(card).toLowerCase();
    if (!code) return "";
    const match = [...document2.querySelectorAll("a[href]")].find((a) => {
      try {
        const u = new URL(a.getAttribute("href"), "https://www.lenovo.com/");
        return u.pathname.replace(/\/$/, "").toLowerCase().endsWith(`/${code}`);
      } catch (e) {
        return false;
      }
    });
    return match ? match.getAttribute("href") : "";
  }
  function para(document2, ...nodes) {
    const p = document2.createElement("p");
    p.append(...nodes);
    return p;
  }
  function buildProductCell(card, document2) {
    const content = [];
    const nameEl = card.querySelector(".product_title, .product_name");
    const name = clean3(nameEl && nameEl.textContent);
    if (name) {
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      content.push(h3);
    }
    const img = card.querySelector(".normal_image img, .img_box img, .v3card_product_image img");
    if (img) {
      if (!clean3(img.getAttribute("alt")) && name) img.setAttribute("alt", name);
      content.push(para(document2, img));
    }
    const priceWrap = card.querySelector(".price_container");
    if (priceWrap) {
      const startingAt = priceWrap.querySelector(".starting-at-container");
      if (clean3(startingAt && startingAt.textContent)) {
        content.push(para(document2, clean3(startingAt.textContent)));
      }
      const finalEl = priceWrap.querySelector(".final_price span:not(.price-save-mt), .final_price");
      const finalPrice = clean3(finalEl && finalEl.textContent);
      const strikeEl = priceWrap.querySelector('del, s, .strike-through, [class*="strike"], [class*="original_price"]');
      const strike = clean3(strikeEl && strikeEl.textContent);
      if (finalPrice || strike) {
        const p = document2.createElement("p");
        if (strike && strike !== finalPrice) {
          const del = document2.createElement("del");
          del.textContent = strike;
          p.append(del, " ");
        }
        if (finalPrice) {
          const strong = document2.createElement("strong");
          strong.textContent = finalPrice;
          p.append(strong);
        }
        content.push(p);
      }
    }
    const shopBtn = card.querySelector('.product_card_cta_warp .shop_btn, .product_card_cta_warp [role="button"], .product_card_cta_warp a');
    const shopText = clean3(shopBtn && shopBtn.textContent) || "Shop";
    const href = productHref(card, document2);
    if (href) {
      const a = document2.createElement("a");
      a.href = href;
      a.textContent = shopText;
      content.push(para(document2, a));
    }
    return content;
  }
  function buildPhotoCell(panel, document2) {
    const content = [];
    const bg = panel.querySelector("img.background-image-container") || panel.querySelector(".medium_content_container > img");
    if (bg) content.push(para(document2, bg));
    const titleEl = panel.querySelector(".medium_content_container_text_title");
    const title = clean3(titleEl && titleEl.textContent);
    if (title) {
      const h3 = document2.createElement("h3");
      h3.textContent = title;
      content.push(h3);
    }
    panel.querySelectorAll(".medium_content_container_text_desc p").forEach((p) => {
      if (!clean3(p.textContent)) return;
      const out = document2.createElement("p");
      out.innerHTML = p.innerHTML.replace(/(<br\s*\/?>\s*)+$/i, "").trim();
      content.push(out);
    });
    const cta = panel.querySelector(".medium_content_container_text-cta-btn a[href]") || panel.querySelector(".medium_content_container_text-cta a[href]");
    if (cta) {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = clean3(cta.textContent);
      content.push(para(document2, a));
    }
    const logo = [...panel.querySelectorAll("img.medium_content_container_text_logo")].find((i) => i.getAttribute("src"));
    if (logo) content.push(para(document2, logo));
    return content;
  }
  function parse5(element, { document: document2 }) {
    const left = element.querySelector(".layouts_special_2columns11_left") || element.children[0];
    const right = element.querySelector(".layouts_special_2columns11_right") || element.children[1];
    const card = left && left.querySelector(".product_card");
    const panel = right && (right.querySelector(".mediumContainer") || right);
    const productCell = card ? buildProductCell(card, document2) : [];
    const photoCell = panel ? buildPhotoCell(panel, document2) : [];
    if (!productCell.length && !photoCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[productCell.length ? productCell : "", photoCell.length ? photoCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefit.js
  function clean4(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function keepSvg2(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?icon`);
    return img;
  }
  function parse6(element, { document: document2 }) {
    const items = [...element.querySelectorAll(".iconcard-vertical-list__item")];
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector("img");
      const headingEl = item.querySelector("h1, h2, h3, h4, h5, h6");
      const paragraphs = [...item.querySelectorAll("p")].filter((p) => clean4(p.textContent));
      const links = [...item.querySelectorAll(".ctaButton_main a[href]")].filter((a) => clean4(a.textContent));
      if (!headingEl && !paragraphs.length) return;
      const body = [];
      if (headingEl) {
        const h3 = document2.createElement("h3");
        h3.textContent = clean4(headingEl.textContent);
        body.push(h3);
      }
      paragraphs.forEach((p) => {
        const out = document2.createElement("p");
        out.innerHTML = p.innerHTML.trim();
        body.push(out);
      });
      links.forEach((a) => {
        const link2 = document2.createElement("a");
        link2.href = a.getAttribute("href");
        link2.textContent = clean4(a.textContent);
        const p = document2.createElement("p");
        p.append(link2);
        body.push(p);
      });
      let iconCell = "";
      if (icon && icon.getAttribute("src")) {
        keepSvg2(icon);
        if (!clean4(icon.getAttribute("alt"))) icon.setAttribute("alt", "");
        iconCell = icon;
      }
      cells.push([iconCell, body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-benefit", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-membership.js
  var URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/i;
  function clean5(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absolute(url) {
    try {
      return new URL(url, "https://www.lenovo.com/").href;
    } catch (e) {
      return url;
    }
  }
  function keepSvg3(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?icon`);
    return img;
  }
  function parse7(element, { document: document2 }) {
    const slide = element.querySelector(".swiper-slide:not(.swiper-slide-duplicate)") || element;
    let bgImg = null;
    const bgEl = slide.querySelector('.bgCover[style*="url("]') || [...slide.querySelectorAll('[style*="background-image"]')].find((el) => URL_RE.test(el.getAttribute("style")));
    const bgMatch = bgEl ? (bgEl.getAttribute("style") || "").match(URL_RE) : null;
    if (bgMatch) {
      bgImg = document2.createElement("img");
      bgImg.src = absolute(bgMatch[1]);
      bgImg.alt = "";
    } else {
      bgImg = slide.querySelector("img.bgImage, .bgCover > img");
    }
    const logo = [...slide.querySelectorAll(".imageContainer img, .logoContainer img")].find((img) => img.getAttribute("src"));
    if (logo) keepSvg3(logo);
    const copy = [];
    const headingEl = slide.querySelector('.textContainer .heading, .textContainer [role="heading"], .textContainer h1, .textContainer h2, .textContainer h3');
    if (clean5(headingEl && headingEl.textContent)) {
      const h2 = document2.createElement("h2");
      h2.textContent = clean5(headingEl.textContent);
      copy.push(h2);
    }
    const desc = slide.querySelector('.textContainer [class^="desc"], .textContainer [class*=" desc"]');
    if (desc) {
      desc.querySelectorAll("ul, ol").forEach((list) => {
        const out = document2.createElement(list.tagName.toLowerCase());
        list.querySelectorAll(":scope > li").forEach((li) => {
          if (!clean5(li.textContent)) return;
          const item = document2.createElement("li");
          item.innerHTML = li.innerHTML.trim();
          out.append(item);
        });
        if (out.children.length) copy.push(out);
      });
      desc.querySelectorAll(":scope > p").forEach((p) => {
        if (clean5(p.textContent)) copy.push(p);
      });
    }
    const ctaWrap = slide.querySelector('.textContainer [class*="cta"], .textContainer .buttoncommen');
    if (ctaWrap) {
      const ctaEl = ctaWrap.querySelector('a[href], button, [role="button"]');
      const href = (ctaWrap.querySelector("a[href]") || { getAttribute: () => "" }).getAttribute("href") || ctaEl && (ctaEl.getAttribute("data-href") || ctaEl.getAttribute("data-url")) || "";
      if (href && !/^(#|javascript:)/i.test(href)) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = clean5(ctaEl && ctaEl.textContent) || "Learn More";
        const p = document2.createElement("p");
        p.append(a);
        copy.push(p);
      }
    }
    if (!copy.length && !bgImg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImg) cells.push([bgImg, ""]);
    cells.push([logo || "", copy]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-membership", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-featured.js
  var GENERIC_ALT = /^(small_content_card_image|image|img|photo)$/i;
  function clean6(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function cleanHtml(html) {
    return (html || "").replace(/\s+/g, " ").replace(/(<br\s*\/?>\s*)+$/i, "").trim();
  }
  function buildDescription(desc, document2) {
    const out = [];
    if (!desc) return out;
    const lists = [...desc.querySelectorAll("ul, ol")];
    if (lists.length) {
      lists.forEach((list) => {
        const l = document2.createElement(list.tagName.toLowerCase());
        list.querySelectorAll(":scope > li").forEach((li) => {
          if (!clean6(li.textContent)) return;
          const item = document2.createElement("li");
          item.innerHTML = cleanHtml(li.innerHTML);
          l.append(item);
        });
        if (l.children.length) out.push(l);
      });
    }
    const paras = [...desc.querySelectorAll("p")].filter((p) => clean6(p.textContent) && !p.closest("li"));
    paras.forEach((p) => {
      const np = document2.createElement("p");
      np.innerHTML = cleanHtml(p.innerHTML);
      out.push(np);
    });
    if (!out.length && clean6(desc.textContent)) {
      const np = document2.createElement("p");
      np.innerHTML = cleanHtml(desc.innerHTML);
      out.push(np);
    }
    return out;
  }
  function parse8(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".small_content")];
    const cells = [];
    cards.forEach((card) => {
      const photo = card.querySelector("img.background-image-container") || card.querySelector(".small_content_container_media img") || card.querySelector("img:not(.small_content_container_text_logo)");
      const logo = [...card.querySelectorAll("img.small_content_container_text_logo")].find((img) => img.getAttribute("src"));
      const titleEl = card.querySelector(".small_content_container_text_title");
      const title = clean6(titleEl && titleEl.textContent);
      const desc = card.querySelector(".small_content_container_text_desc");
      const cta = card.querySelector(".small_content_container-cta-btn a[href]") || card.querySelector(".small_content_container--cta a[href]");
      if (!title && !photo) return;
      const body = [];
      if (logo) {
        const p = document2.createElement("p");
        p.append(logo);
        body.push(p);
      }
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      body.push(...buildDescription(desc, document2));
      if (cta && clean6(cta.textContent)) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = clean6(cta.textContent);
        const p = document2.createElement("p");
        p.append(a);
        body.push(p);
      }
      if (photo && GENERIC_ALT.test(clean6(photo.getAttribute("alt")))) photo.setAttribute("alt", "");
      cells.push([photo || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-series.js
  function clean7(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse9(element, { document: document2 }) {
    let cards = [...element.querySelectorAll("article.segment-spot-card")];
    if (!cards.length) cards = [...element.querySelectorAll(".swiper-slide")];
    cards = cards.filter((c) => !c.closest(".swiper-slide-duplicate"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const img = card.querySelector(".small-icon-item-head-image img") || card.querySelector("img");
      const headlineEl = card.querySelector(".headline h1, .headline h2, .headline h3, .headline h4, .headline");
      const headline = clean7(headlineEl && headlineEl.textContent);
      const labels = [...card.querySelectorAll(".desctext p")].filter((p) => clean7(p.textContent));
      const descText = card.querySelector(".desctext");
      const action = card.querySelector("a.segment-spot-card-action[href]") || card.querySelector(".small-icon-item-cta a[href]");
      const btn = card.querySelector(".small-icon-item-cta-btn, .small-icon-item-cta button");
      if (!headline && !img) return;
      const key = action && action.getAttribute("href") || headline;
      if (seen.has(key)) return;
      seen.add(key);
      const body = [];
      if (headline) {
        const h3 = document2.createElement("h3");
        h3.textContent = headline;
        body.push(h3);
      }
      if (labels.length) {
        labels.forEach((p) => {
          const out = document2.createElement("p");
          out.innerHTML = p.innerHTML.trim();
          body.push(out);
        });
      } else if (clean7(descText && descText.textContent)) {
        const out = document2.createElement("p");
        out.textContent = clean7(descText.textContent);
        body.push(out);
      }
      if (action) {
        const a = document2.createElement("a");
        a.href = action.getAttribute("href");
        a.textContent = clean7(btn && btn.textContent) || clean7(action.textContent) || "Shop Now";
        const p = document2.createElement("p");
        p.append(a);
        body.push(p);
      }
      if (img && !clean7(img.getAttribute("alt"))) img.setAttribute("alt", "");
      cells.push([img || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-series", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-listing.js
  function clean8(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function absolute2(href) {
    if (!href) return "";
    try {
      return new URL(href, "https://www.lenovo.com/").href;
    } catch (e) {
      return href;
    }
  }
  function keepSvg4(img) {
    const src = img.getAttribute("src") || "";
    if (/\.svg$/i.test(src)) img.setAttribute("src", `${src}?icon`);
    return img;
  }
  function para2(document2, ...nodes) {
    const p = document2.createElement("p");
    p.append(...nodes);
    return p;
  }
  function link(document2, href, text) {
    const a = document2.createElement("a");
    a.href = absolute2(href);
    a.textContent = text;
    return a;
  }
  function buildProduct(item, document2) {
    const titleLink = item.querySelector(".product_title a[href]");
    const titleEl = titleLink || item.querySelector(".product_title");
    const name = clean8(titleEl && titleEl.textContent);
    const pdp = titleLink && titleLink.getAttribute("href") || item.getAttribute("data-dlp-url") || "";
    const img = item.querySelector(".normal_image img") || item.querySelector(".product_image_content img:not(.image_blur)");
    if (!name && !img) return null;
    const body = [];
    const badge = clean8((item.querySelector(".merchandising_flag") || {}).textContent);
    if (badge) {
      const strong = document2.createElement("strong");
      strong.textContent = badge;
      body.push(para2(document2, strong));
    }
    if (name) {
      const h3 = document2.createElement("h3");
      if (pdp) h3.append(link(document2, pdp, name));
      else h3.textContent = name;
      body.push(h3);
    }
    item.querySelectorAll(".copilot-plus-badge_label, .copilot-plus-badge_content").forEach((el) => {
      if (el.matches(".copilot-plus-badge_content") && el.querySelector(".copilot-plus-badge_label")) return;
      const text = clean8(el.textContent);
      if (text) body.push(para2(document2, text));
    });
    const priceStack = item.querySelector(".price-stack");
    if (priceStack) {
      const startingAt = clean8((priceStack.querySelector(".starting-at-container") || {}).textContent);
      const price = clean8((priceStack.querySelector(".price-title") || {}).textContent);
      const strike = clean8((priceStack.querySelector(".strike-through-price") || {}).textContent);
      if (price || strike) {
        const p = document2.createElement("p");
        if (startingAt) p.append(`${startingAt} `);
        if (strike && strike !== price) {
          const del = document2.createElement("del");
          del.textContent = strike;
          p.append(del, " ");
        }
        if (price) {
          const strong = document2.createElement("strong");
          strong.textContent = price;
          p.append(strong);
        }
        body.push(p);
      }
    }
    const specs = [...item.querySelectorAll(".features li")].map((li) => clean8(li.textContent)).filter(Boolean);
    if (specs.length) {
      const ul = document2.createElement("ul");
      specs.forEach((s) => {
        const li = document2.createElement("li");
        li.textContent = s;
        ul.append(li);
      });
      body.push(ul);
    }
    const cta = item.querySelector("a.product_cta_button[href], .cta_container a[href]");
    if (cta && clean8(cta.textContent)) {
      body.push(para2(document2, link(document2, cta.getAttribute("href"), clean8(cta.textContent))));
    }
    if (img && !clean8(img.getAttribute("alt")) && name) img.setAttribute("alt", name);
    return [img || "", body];
  }
  function buildPromo(item, document2) {
    const logo = item.querySelector(".financingLogoImg img, img");
    const title = clean8((item.querySelector(".financingContentHeader") || {}).textContent);
    const texts = [...item.querySelectorAll(".financingContent p")].filter((p) => !p.closest(".financingContentHeader") && clean8(p.textContent));
    const cta = item.querySelector(".interruptersButton a[href], a.cta-button[href]");
    if (!title && !texts.length) return null;
    const body = [];
    if (title) {
      const strong = document2.createElement("strong");
      strong.textContent = title;
      body.push(para2(document2, strong));
    }
    texts.forEach((p) => {
      const out = document2.createElement("p");
      out.innerHTML = p.innerHTML.trim();
      body.push(out);
    });
    if (cta && clean8(cta.textContent)) {
      body.push(para2(document2, link(document2, cta.getAttribute("href"), clean8(cta.textContent))));
    }
    if (logo) keepSvg4(logo);
    return [logo || "", body];
  }
  function parse10(element, { document: document2 }) {
    const items = [...element.querySelectorAll("li.product_item")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      const isPromo = item.matches('[class*="product_interruptors"]') || !!item.querySelector(".product_interruptors_card");
      const code = item.getAttribute("data-product-code");
      if (code) {
        if (seen.has(code)) return;
        seen.add(code);
      }
      const row = isPromo ? buildPromo(item, document2) : buildProduct(item, document2);
      if (row) cells.push(row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-listing", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product-accessories.js
  function clean9(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function para3(document2, ...nodes) {
    const p = document2.createElement("p");
    p.append(...nodes);
    return p;
  }
  function productCode2(card) {
    const idEl = card.querySelector(".product_title [id], .product_name [id]");
    if (idEl && /^[a-z0-9]{6,}$/i.test(idEl.id)) return idEl.id;
    const m = (card.className || "").match(/product_card_([A-Z0-9]{6,})/i);
    return m ? m[1] : "";
  }
  function productHref2(card, document2) {
    const own = card.querySelector('a[href]:not([href^="#"]):not([href^="javascript"])');
    if (own) return own.getAttribute("href");
    const dataEl = [card, ...card.querySelectorAll("[data-href], [data-url], [data-link-url]")].find((el) => el.getAttribute("data-href") || el.getAttribute("data-url") || el.getAttribute("data-link-url"));
    if (dataEl) {
      return dataEl.getAttribute("data-href") || dataEl.getAttribute("data-url") || dataEl.getAttribute("data-link-url");
    }
    const code = productCode2(card).toLowerCase();
    if (!code) return "";
    const match = [...document2.querySelectorAll("a[href]")].find((a) => {
      try {
        const u = new URL(a.getAttribute("href"), "https://www.lenovo.com/");
        return u.pathname.replace(/\/$/, "").toLowerCase().endsWith(`/${code}`);
      } catch (e) {
        return false;
      }
    });
    return match ? match.getAttribute("href") : "";
  }
  function absolute3(href) {
    try {
      return new URL(href, "https://www.lenovo.com/").href;
    } catch (e) {
      return href;
    }
  }
  function buildRow(card, document2) {
    const nameEl = card.querySelector(".product_title, .product_name");
    const name = clean9(nameEl && nameEl.textContent);
    const img = card.querySelector(".normal_image img, .img_box img, .v3card_product_image img");
    if (!name && !img) return null;
    const body = [];
    const label = clean9((card.querySelector(".merchandising_flag") || {}).textContent);
    if (label) body.push(para3(document2, label));
    if (name) {
      const h3 = document2.createElement("h3");
      h3.textContent = name;
      body.push(h3);
    }
    const priceWrap = card.querySelector(".price_container");
    if (priceWrap) {
      const strikeEl = priceWrap.querySelector(".strike-through-price .price");
      const strike = clean9(strikeEl && strikeEl.textContent);
      let finalPrice = "";
      const finalEl = priceWrap.querySelector(".final_price");
      if (finalEl) {
        const copy = finalEl.cloneNode(true);
        copy.querySelectorAll(".price-save-mt, .price-save-pc").forEach((s) => s.remove());
        finalPrice = clean9(copy.textContent);
      }
      if (strike || finalPrice) {
        const p = document2.createElement("p");
        if (strike && strike !== finalPrice) {
          const del = document2.createElement("del");
          del.textContent = strike;
          p.append(del);
          if (finalPrice) p.append(" ");
        }
        if (finalPrice) {
          const strong = document2.createElement("strong");
          strong.textContent = finalPrice;
          p.append(strong);
        }
        body.push(p);
      }
      const discount = clean9((priceWrap.querySelector(".price-save-mt, .price-save-pc") || {}).textContent);
      if (discount) body.push(para3(document2, discount));
    }
    const href = productHref2(card, document2);
    if (href) {
      const btn = card.querySelector('.product_card_cta_warp .shop_btn, .product_card_cta_warp [role="button"]');
      const a = document2.createElement("a");
      a.href = absolute3(href);
      a.textContent = clean9(btn && btn.textContent) || "Shop";
      body.push(para3(document2, a));
    }
    if (img && !clean9(img.getAttribute("alt")) && name) img.setAttribute("alt", name);
    return { key: productCode2(card) || name, row: [img || "", body] };
  }
  function parse11(element, { document: document2 }) {
    const cards = [...element.querySelectorAll(".product_card")].filter((c) => !c.closest(".swiper-slide-duplicate"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const item = buildRow(card, document2);
      if (!item || seen.has(item.key)) return;
      seen.add(item.key);
      cells.push(item.row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "Cards Product (accessories)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function clean10(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse12(element, { document: document2 }) {
    let items = [...element.querySelectorAll("article.x-cms-ai-ofp-fe-2c-accordion__item")];
    if (!items.length) items = [...element.querySelectorAll('[class*="accordion__item"]')];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector('[class*="accordion__label-text"]') || item.querySelector('[class*="accordion__tab-label"]');
      const question = clean10(labelEl && labelEl.textContent);
      const content = item.querySelector('[class*="accordion__content"]');
      if (!question || !content) return;
      const answer = [];
      [...content.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (clean10(n.textContent)) {
            const p = document2.createElement("p");
            p.textContent = clean10(n.textContent);
            answer.push(p);
          }
          return;
        }
        if (n.nodeType !== 1) return;
        if (!clean10(n.textContent) && !n.querySelector("img")) return;
        if (/^(P|UL|OL|TABLE|H[1-6]|BLOCKQUOTE)$/.test(n.tagName)) {
          answer.push(n);
        } else {
          const p = document2.createElement("p");
          p.innerHTML = n.tagName === "DIV" ? n.innerHTML : n.outerHTML;
          answer.push(p);
        }
      });
      if (!answer.length) return;
      cells.push([question, answer]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lenovo-laptops-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function isBlank(el) {
    return !el.textContent.replace(/ /g, " ").trim() && !el.querySelector("img, picture, video, iframe, svg, table, hr");
  }
  function mainChildOf(node) {
    let cur = node;
    while (cur && cur.parentElement) {
      if (cur.parentElement.matches("main.main_content")) return cur;
      cur = cur.parentElement;
    }
    return null;
  }
  function collapseAdjacentHrs(element) {
    element.querySelectorAll("hr").forEach((hr) => {
      if (!hr.isConnected) return;
      let next = hr.nextSibling;
      while (next && next.nodeType === 3 && !next.textContent.trim()) next = next.nextSibling;
      if (next && next.nodeType === 1 && next.tagName === "HR") {
        const keepNext = next.attributes.length > 0 || hr.attributes.length === 0;
        if (keepNext) hr.remove();
        else next.remove();
      }
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["script", "style", "noscript", "link", "meta", "template"]);
      element.querySelectorAll('.page_body > [id="$_fragment_uuid"]').forEach((frag) => {
        if (!frag.querySelector("main")) frag.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        ".commonHeaderPlaceHolder",
        "nav.commonHeader",
        "footer.commonFooter",
        ".fragment-placeholder",
        ".page_config_info",
        // CMS tooling (tooltip/highlight/fps toggles)
        ".ui-toggle"
        // button#uiToggleTopStart, button#uiToggleBottom
      ]);
      element.querySelectorAll(":scope > h1, :scope > h2, :scope > h3").forEach((h) => h.remove());
      WebImporter.DOMUtils.remove(element, [
        "#INDWrap",
        // accessibility toolbar
        "#_evidon_banner",
        // cookie consent banner
        ".bottomStickyDock",
        // back-to-top + compare dock (help dock)
        ".Q26696HelpLine",
        // Lenovo Pro join bar (.wpc-lenovo-pro-hub-benefits-sticky-banner)
        ".wpc-lenovo-pro-hub-benefits-sticky-banner",
        "#inside_holder",
        // live chat tab
        "#proCommunity",
        // Lenovo Pro terms popup
        ".sheer-id-popup",
        // SheerID success modal
        ".sheerIDsuccess",
        ".rbkey_content_none",
        // hidden i18n strings for modals
        "#snackbar",
        "#globalSnackBar",
        "#timerLoggedOut",
        "#dlp-new-login",
        ".public-store-alert",
        "#store-alert-pc",
        "#test",
        ".common-compare-popup",
        // body-level "compare" bubbles
        ".tool-tip-popup",
        // body-level facet tooltips
        ".le-popover",
        // price/rewards popovers (body-level and inline)
        '[id^="crl8-gallery"][id$="-modal"]'
        // Curalate video-commerce modal
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".sr-only",
        // "Add To Cart" in hero, srAnnouncer_*, carousel status, etc.
        ".espot-main__visually-hidden",
        // "Featured content"
        ".INDhiddenText"
      ]);
      element.querySelectorAll(".bazaarVoice").forEach((bv) => {
        const container = mainChildOf(bv);
        if (container) container.remove();
        else bv.remove();
      });
      element.querySelectorAll(".anchor_nav .anchor_nav__text").forEach((btn) => {
        if (btn.textContent.trim().toLowerCase() === "reviews") btn.remove();
      });
      WebImporter.DOMUtils.remove(element, [".heroTitle .mobileOnly", ".heroTitle .tabletOnly"]);
      [
        [".small_content_container-cta-btn a", "a.small_content_container-cta-link"],
        [".medium_content_container_text-cta-btn a", "a.medium_content_container_text-cta-link"]
      ].forEach(([primarySel, dupSel]) => {
        element.querySelectorAll(dupSel).forEach((dup) => {
          const scope = dup.parentElement;
          const primary = scope && scope.querySelector(primarySel);
          if (primary && primary !== dup && (primary.getAttribute("href") || "") === (dup.getAttribute("href") || "")) {
            dup.remove();
          }
        });
      });
      WebImporter.DOMUtils.remove(element, [
        ".small_content_flip_container",
        ".medium_content_flip_container",
        ".medium_content_play",
        ".dx-thinkpad-yt-video-play"
        // play-icon overlay on the video poster
      ]);
      element.querySelectorAll(".small_content .caption, .mediumContainer .caption").forEach((el) => {
        if (isBlank(el)) el.remove();
      });
      element.querySelectorAll("img.small_content_container_text_logo, img.medium_content_container_text_logo").forEach((img) => {
        if (!img.getAttribute("src")) img.remove();
      });
      element.querySelectorAll(
        '.fujiSmallMediumLayout > img, [class^="cms_background_layout_"] > img, .cms_layoutBox_auto_height > img'
      ).forEach((img) => img.remove());
      WebImporter.DOMUtils.remove(element, [
        "section.pc_left_facets",
        // filters, "Expand All", sort, price_sort dropdown
        ".facet_filter",
        ".query_view_wrap",
        // "52 Matching results", "Clear All", sort button
        ".matching_results",
        ".sortbtn",
        ".price_sort",
        ".al_unavailable_view",
        "#dlpGroupLoadEl",
        ".skeleton_product_card",
        // loading shimmer
        ".pc_footer_page",
        // "Showing 1 - 9 of 52 Results" + "Load more results"
        ".pc_loading",
        // "One moment please..."
        ".facetName",
        ".facetId"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".common-compare-container",
        // "Compare" checkbox
        ".rating-box",
        // listing star ratings wrapper
        ".rating_container",
        // accessory star ratings wrapper
        ".card-rating-container",
        ".pc_fps_rating",
        ".card-wish_popover",
        // accessory wishlist heart + "Save to" list popover
        ".card-wish-container",
        ".hover_image .mask",
        // listing hover mask: wishlist heart + gallery/video buttons
        ".heart",
        ".productGalleryOverride",
        ".loyalty-container",
        // "My Lenovo Rewards / Earn $N in Rewards / Join Now!"
        ".loyalty-price-color",
        ".tool_tip_container"
        // tooltip icon next to "Est Value"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".swiper-pagination",
        ".swiper-pagination_dots_card",
        // product carousel dots
        ".swiper-button-next",
        ".swiper-button-prev",
        ".swiper-notification",
        ".SplitterProductCarousel .prevBtn",
        // accessory carousel arrows
        ".SplitterProductCarousel .nextBtn",
        ".card_immersive .other-content"
      ]);
      [...element.querySelectorAll("div.container9999")].reverse().forEach((c) => {
        if (c.isConnected && isBlank(c)) c.remove();
      });
      element.querySelectorAll("main.main_content > div").forEach((c) => {
        if (isBlank(c)) c.remove();
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[id^="batBeacon"]',
        'img[src*="bat.bing.com"]',
        "#qualaroo_dnt_frame"
      ]);
      element.querySelectorAll("iframe").forEach((f) => {
        if (!f.closest("table")) f.remove();
      });
      WebImporter.DOMUtils.remove(element, ["link", "noscript", "script", "style", "meta", "template", "select", "button:empty"]);
      collapseAdjacentHrs(element);
      element.querySelectorAll("[data-track], [onclick]").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/lenovo-laptops-sections.js
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

  // tools/importer/import-laptops.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-brand": parse,
    "anchor-nav-sticky": parse2,
    "embed-video": parse3,
    "cards-reveal": parse4,
    "columns-spotlight": parse5,
    "cards-benefit": parse6,
    "columns-membership": parse7,
    "cards-featured": parse8,
    "cards-series": parse9,
    "cards-listing": parse10,
    "cards-product": parse11,
    "accordion-faq": parse12
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
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
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
  function pendingLazyContainers(document2) {
    return [...document2.querySelectorAll("main .comp_lazyload")].filter((el) => ![...el.children].some((c) => !c.classList.contains("comp_lazyload_resource"))).length;
  }
  var import_laptops_default = {
    // Awaited by the importer before transform: scroll through the page so every
    // lazy section (and its images) renders, then return to the top.
    onLoad: (_0) => __async(void 0, [_0], function* ({ document: document2 }) {
      const win = document2.defaultView || window;
      const sleep = (ms) => new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
      for (let pass = 0; pass < 3; pass += 1) {
        const step = Math.round((win.innerHeight || 800) * 0.8);
        for (let y = 0; y < document2.body.scrollHeight; y += step) {
          win.scrollTo(0, y);
          yield sleep(250);
        }
        yield sleep(1500);
        const pending = pendingLazyContainers(document2);
        console.log(`onLoad pass ${pass + 1}: ${pending} lazy container(s) still empty`);
        if (!pending) break;
      }
      const hydrated = (el) => {
        const cards = [...el.querySelectorAll(".product_card")];
        const cardsOk = cards.every((card) => card.querySelector(".normal_image img[src], .img_box img[src]") && card.querySelector(".final_price"));
        const linksOk = [...el.querySelectorAll("a.segment-spot-card-action")].every((a) => a.getAttribute("href"));
        return cardsOk && linksOk;
      };
      const targets = [...document2.querySelectorAll(".SplitterProductCarousel, .x-cms-ofp-fe-2c-widgets-segmentespots")];
      for (const el of targets) {
        el.scrollIntoView({ block: "center" });
        for (let waited = 0; waited < 6e3 && !hydrated(el); waited += 300) {
          yield sleep(300);
        }
        console.log(`onLoad hydrate ${el.className.split(" ")[0]}: ${hydrated(el) ? "ready" : "TIMED OUT"}`);
      }
      document2.querySelectorAll("a.segment-spot-card-action[href]").forEach((a) => {
        if (!a.textContent.trim()) a.textContent = a.getAttribute("aria-label") || "Shop Now";
      });
      win.scrollTo(0, 0);
      yield sleep(500);
    }),
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
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
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
  return __toCommonJS(import_laptops_exports);
})();
