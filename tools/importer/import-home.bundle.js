var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-carousel__item")];
    if (!slides.length) slides = [...element.querySelectorAll(".len-hero-banner")];
    const cells = [];
    slides.forEach((slide, index) => {
      let photo = slide.querySelector(".landing-hero-media img");
      if (!photo) {
        photo = [...slide.querySelectorAll("img")].find((img) => !img.closest('[class*="content-logo"]')) || null;
      }
      const content = [];
      const logo = slide.querySelector('[class*="inner-content-logo"] img');
      if (logo && logo !== photo) {
        const p = document2.createElement("p");
        p.append(logo);
        content.push(p);
      }
      const srcHeading = slide.querySelector(".len-hero-banner__wrapper-bg-inner-content-titles h1, .len-hero-banner__wrapper-bg-inner-content-titles h2") || slide.querySelector("h1, h2, h3");
      if (srcHeading) {
        const h = document2.createElement(index === 0 ? "h1" : "h2");
        h.innerHTML = srcHeading.innerHTML;
        content.push(h);
      }
      const titles = slide.querySelector(".len-hero-banner__wrapper-bg-inner-content-titles");
      const descs = titles ? [...titles.querySelectorAll("p")] : [...slide.querySelectorAll("p.body-large")];
      descs.forEach((d) => {
        if (!d.textContent.trim()) return;
        const p = document2.createElement("p");
        p.innerHTML = d.innerHTML;
        content.push(p);
      });
      let ctas = [...slide.querySelectorAll(".action a[href]")];
      if (!ctas.length) ctas = [...slide.querySelectorAll("a.cta[href]")];
      ctas.forEach((a, i) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        const p = document2.createElement("p");
        if (i === 0) {
          const strong = document2.createElement("strong");
          strong.append(link);
          p.append(strong);
        } else {
          p.append(link);
        }
        content.push(p);
      });
      if (!photo && !content.length) return;
      cells.push([photo || "", content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".len-card-item")];
    if (!items.length) items = [...element.querySelectorAll(".len-card")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".len-card__asset img, img");
      const titleEl = item.querySelector('.len-card__content-title, [class*="title"]');
      const label = (titleEl ? titleEl.textContent : item.textContent).trim();
      const anchor = item.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      if (!img && !label) return;
      const p = document2.createElement("p");
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      cells.push([img || "", p]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-prompt.js
  function resolveImage(img, document2) {
    if (!img) return null;
    let src = img.getAttribute("src") || img.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const picture = img.closest("picture");
      const candidates = [
        img.getAttribute("data-srcset"),
        img.getAttribute("srcset"),
        ...picture ? [...picture.querySelectorAll("source")].flatMap((s) => [s.getAttribute("data-srcset"), s.getAttribute("srcset")]) : []
      ].filter(Boolean);
      if (candidates.length) src = candidates[candidates.length - 1].split(",")[0].trim().split(/\s+/)[0];
    }
    if (!src || src.startsWith("data:")) return null;
    const out = document2.createElement("img");
    out.src = src;
    out.alt = (img.getAttribute("alt") || "").trim();
    return out;
  }
  function imageParagraph(img, document2) {
    const p = document2.createElement("p");
    p.append(img);
    return p;
  }
  function keyOf(el2) {
    if (!el2) return "";
    const cls = [...el2.classList].find((c) => c.startsWith("_content_")) || "";
    return normalizeKey(cls);
  }
  function normalizeKey(value) {
    if (!value) return "";
    const v = value.replace(/^https?:\/\/[^/]+/, "");
    return v.toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function loadFragment(xfPath, document2) {
    if (!xfPath || typeof XMLHttpRequest === "undefined" || typeof DOMParser === "undefined") return null;
    const url = /\.html$/.test(xfPath) ? xfPath : `${xfPath}.html`;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.send();
      if (xhr.status !== 200) return null;
      const doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
      return { root: doc.querySelector(".len-prompt-container__results-content--media-container") || doc.body, base: url };
    } catch (e) {
      return null;
    }
  }
  function absolute(href, base) {
    if (!href) return href;
    try {
      return new URL(href, base || "https://www.lenovo.com/").href;
    } catch (e) {
      return href;
    }
  }
  function parse3(element, { document: document2 }) {
    const cells = [];
    const intro = [];
    const bgImg = resolveImage(
      element.querySelector(".len-prompt-container__bg-image--main > .picture-tag img, .len-prompt-container__bg-image img"),
      document2
    );
    if (bgImg) intro.push(imageParagraph(bgImg, document2));
    const heading = element.querySelector(".len-prompt-container__actions-group-list-heading") || element.querySelector(".len-prompt-container__actions h2, .len-prompt-container__actions h3");
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.trim();
      intro.push(h2);
    }
    if (intro.length) cells.push([intro]);
    const resultSets = [];
    const xfPaths = [...element.querySelectorAll(".len-prompt-xf-path")];
    xfPaths.forEach((xf) => {
      const inline = xf.querySelector(".len-prompt-container__results-content--media-container");
      if (inline) {
        resultSets.push({ root: inline, base: "", key: keyOf(inline) });
        return;
      }
      const path = xf.getAttribute("data-xf-path");
      const loaded = loadFragment(path, document2);
      if (loaded) resultSets.push({ ...loaded, key: normalizeKey(path) });
    });
    if (!xfPaths.length) {
      element.querySelectorAll(".len-prompt-container__results-content--media-container").forEach((r) => resultSets.push({ root: r, base: "", key: keyOf(r) }));
    }
    const resultsByKey = new Map(resultSets.map((r) => [r.key, r]));
    let prompts = [...element.querySelectorAll(".len-prompt-container__results-content-actions-prompts > .cta-button__wrap")].map((wrap) => ({ label: wrap.textContent.trim(), key: keyOf(wrap) }));
    if (!prompts.length) {
      const seen = /* @__PURE__ */ new Set();
      prompts = [...element.querySelectorAll(".len-prompt-container__actions-group-list-btn button")].map((b) => b.textContent.trim()).filter((t) => t && !seen.has(t) && seen.add(t)).map((label) => ({ label, key: "" }));
    }
    prompts.forEach((prompt, index) => {
      if (!prompt.label) return;
      const set = prompt.key && resultsByKey.get(prompt.key) || resultSets[index];
      const result = set ? set.root : null;
      const base = set ? set.base : "";
      const content = [];
      if (result) {
        const media = result.querySelector(".len-prompt-container__results-content--media");
        const img = resolveImage(media ? media.querySelector("img") : null, document2);
        if (img) {
          if (base) img.src = absolute(img.getAttribute("src"), base);
          content.push(imageParagraph(img, document2));
        }
        const caption = result.querySelector(".len-prompt-container__results-description-container.desktop-only .len-prompt-container__results-content--description") || result.querySelector(".len-prompt-container__results-content--description");
        if (caption && caption.textContent.trim()) {
          const h3 = document2.createElement("h3");
          h3.textContent = caption.textContent.trim();
          content.push(h3);
        }
        result.querySelectorAll(".prompt-item").forEach((item) => {
          const titleEl = item.querySelector(".prompt-item-content--title, h5, h4, h3");
          const descEl = item.querySelector(".prompt-item-content--description, p");
          const linkEl = item.querySelector("a.prompt-item-action-container[href], a[href]");
          const title = titleEl ? titleEl.textContent.trim() : "";
          if (!title) return;
          const h3 = document2.createElement("h3");
          if (linkEl) {
            const a = document2.createElement("a");
            a.href = base ? absolute(linkEl.getAttribute("href"), base) : linkEl.getAttribute("href");
            a.textContent = title;
            h3.append(a);
          } else {
            h3.textContent = title;
          }
          content.push(h3);
          if (descEl && descEl.textContent.trim()) {
            const p = document2.createElement("p");
            p.textContent = descEl.textContent.trim();
            content.push(p);
          }
        });
      }
      cells.push([prompt.label, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-prompt", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".len-card-item")];
    if (!items.length) items = [...element.querySelectorAll(".len-card")];
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".len-card__bg-image img, .len-card__asset img, picture img");
      const titleEl = item.querySelector(".len-card__content-title, h3, h2, h4");
      const textEl = item.querySelector(".len-card__content-text, .len-card__content-text-container p");
      const anchor = item.querySelector("a[href]");
      const href = anchor ? anchor.getAttribute("href") : "";
      const title = titleEl ? titleEl.textContent.trim() : "";
      const text = textEl ? textEl.textContent.trim() : "";
      if (!img && !title && !text) return;
      const body = [];
      if (title) {
        const h3 = document2.createElement("h3");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        body.push(h3);
      }
      if (text) {
        const p = document2.createElement("p");
        p.textContent = text;
        body.push(p);
      }
      if (!title && href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = text || href;
        p.append(a);
        body.push(p);
      }
      cells.push([img || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function absolute2(url) {
    if (!url) return "";
    try {
      return new URL(url, "https://www.lenovo.com/").href;
    } catch (e) {
      return url;
    }
  }
  function iconUrl(item, document2) {
    const holder = item.querySelector(".len-card__asset .cmp-icon[data-cmp-src], .len-card__asset [data-cmp-src]");
    if (holder) return absolute2(holder.getAttribute("data-cmp-src"));
    const iconEl = item.querySelector(".len-card__asset .len-icon-image, .len-icon-image");
    const iconClass = iconEl ? [...iconEl.classList].find((c) => /^len-icon__/.test(c)) : null;
    const styles = [...item.querySelectorAll("style")];
    if (iconClass) styles.push(...document2.querySelectorAll("style"));
    for (const style of styles) {
      const css = style.textContent || "";
      if (iconClass && !css.includes(iconClass)) continue;
      const m = css.match(/mask-image:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (m) return absolute2(m[1]);
    }
    if (iconEl && typeof window !== "undefined" && window.getComputedStyle) {
      const cs = window.getComputedStyle(iconEl);
      const val = cs.getPropertyValue("mask-image") || cs.getPropertyValue("-webkit-mask-image") || "";
      const m = val.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (m) return absolute2(m[1]);
    }
    return "";
  }
  function parse5(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".len-card-item")];
    if (!items.length) items = [...element.querySelectorAll(".len-card")];
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".len-card__content-title, h3, h2, h4");
      const textEl = item.querySelector(".len-card__content-text, .len-card__content-text-container p");
      const linkEl = item.querySelector(".len-card__content-cta a[href], a[href]");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const text = textEl ? textEl.textContent.trim() : "";
      if (!title && !text) return;
      let icon = item.querySelector(".len-card__asset img");
      if (!icon) {
        const src = iconUrl(item, document2);
        if (src) {
          icon = document2.createElement("img");
          icon.src = /\.svg$/i.test(src) ? `${src}?icon` : src;
          icon.alt = "";
        }
      }
      const body = [];
      if (title) {
        const h3 = document2.createElement("h3");
        h3.textContent = title;
        body.push(h3);
      }
      if (text) {
        const p = document2.createElement("p");
        p.textContent = text;
        body.push(p);
      }
      if (linkEl) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = linkEl.getAttribute("href");
        a.textContent = linkEl.textContent.trim() || title;
        p.append(a);
        body.push(p);
      }
      cells.push([icon || "", body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-rewards.js
  function parse6(element, { document: document2 }) {
    const cells = [];
    const bg = element.querySelector(".len-content-package-banner-bg-image > .picture-tag img") || element.querySelector('[class*="bg-image--main"] img, [class*="banner-bg-image"] img');
    const content = [];
    const wrap = element.querySelector(".content-package-banner-content__wrap") || element.querySelector(".content-package-banner-left") || element;
    const headingEl = wrap.querySelector('h1, h2, h3, .display-headline-4xlg, p[class*="headline"]');
    if (headingEl) {
      const h2 = document2.createElement("h2");
      h2.textContent = headingEl.textContent.trim();
      content.push(h2);
    }
    [...wrap.querySelectorAll("p")].filter((p) => p !== headingEl && p.textContent.trim()).forEach((p) => {
      const para = document2.createElement("p");
      para.innerHTML = p.innerHTML;
      content.push(para);
    });
    let ctas = [...element.querySelectorAll(".content-package-banner-actions a[href]")];
    if (!ctas.length) ctas = [...element.querySelectorAll(".content-package-banner-left a.cta[href]")];
    ctas.forEach((a, i) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document2.createElement("p");
      if (i === 0) {
        const strong = document2.createElement("strong");
        strong.append(link);
        p.append(strong);
      } else {
        p.append(link);
      }
      content.push(p);
    });
    const listSrc = element.querySelector(".content-package-banner__list");
    const ul = document2.createElement("ul");
    if (listSrc) {
      const entries = listSrc.querySelectorAll("li").length ? [...listSrc.querySelectorAll("li")] : [...listSrc.querySelectorAll("p")];
      entries.forEach((e) => {
        const text = e.textContent.trim();
        if (!text) return;
        const li = document2.createElement("li");
        li.innerHTML = e.innerHTML.trim();
        ul.append(li);
      });
    }
    if (!content.length && !ul.children.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (bg) cells.push([bg, ""]);
    cells.push([content, ul.children.length ? ul : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-rewards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-casestudy.js
  function absolute3(url) {
    if (!url) return "";
    try {
      return new URL(url, "https://www.lenovo.com/").href;
    } catch (e) {
      return url;
    }
  }
  function iconUrl2(scope, document2) {
    const holder = scope.querySelector("[data-cmp-src]");
    if (holder) return absolute3(holder.getAttribute("data-cmp-src"));
    const iconEl = scope.querySelector(".len-icon-image");
    const iconClass = iconEl ? [...iconEl.classList].find((c) => /^len-icon__/.test(c)) : null;
    const styles = [...scope.querySelectorAll("style")];
    if (iconClass) styles.push(...document2.querySelectorAll("style"));
    for (const style of styles) {
      const css = style.textContent || "";
      if (iconClass && !css.includes(iconClass)) continue;
      const m = css.match(/mask-image:\s*url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (m) return absolute3(m[1]);
    }
    if (iconEl && typeof window !== "undefined" && window.getComputedStyle) {
      const cs = window.getComputedStyle(iconEl);
      const val = cs.getPropertyValue("mask-image") || cs.getPropertyValue("-webkit-mask-image") || "";
      const m = val.match(/url\(\s*["']?([^"')]+)["']?\s*\)/i);
      if (m) return absolute3(m[1]);
    }
    return "";
  }
  function el(document2, tag, text) {
    const e = document2.createElement(tag);
    if (text !== void 0) e.textContent = text;
    return e;
  }
  function parse7(element, { document: document2 }) {
    const tabs = [...element.querySelectorAll(".len-tabs__tablist > .len-tabs__tab, .len-tabs__tab")].filter((t, i, arr) => arr.indexOf(t) === i);
    const panels = [...element.querySelectorAll(".len-tabs__tabpanel")];
    const cells = [];
    panels.forEach((panel, index) => {
      const tab = panel.id && tabs.find((t) => t.id && `${t.id}panel` === panel.id) || tabs[index];
      const labelEl = tab ? tab.querySelector(".len-tabs__tab-title") || tab : null;
      const label = labelEl ? labelEl.textContent.trim() : "";
      const intro = [];
      const header = panel.querySelector(".tab-content-header") || panel;
      const title = header.querySelector(".cmp-title__text, h2, h3, h4");
      if (title) intro.push(el(document2, "h3", title.textContent.trim()));
      const desc = header.querySelector(".cmp-title__description");
      if (desc && desc.textContent.trim()) intro.push(el(document2, "p", desc.textContent.trim()));
      [...header.querySelectorAll(".cmp-title__body-wrapper a[href], a.cta[href]")].filter((a, i, arr) => arr.indexOf(a) === i).forEach((a, i) => {
        const p = document2.createElement("p");
        const link = el(document2, "a", a.textContent.trim());
        link.href = a.getAttribute("href");
        if (i === 0) {
          const strong = document2.createElement("strong");
          strong.append(link);
          p.append(strong);
        } else {
          p.append(link);
        }
        intro.push(p);
      });
      const impact = [];
      const quoteCard = panel.querySelector(".quote-card");
      if (quoteCard) {
        const eyebrow = quoteCard.querySelector(".quote-card-title");
        if (eyebrow) impact.push(el(document2, "p", eyebrow.textContent.trim()));
        const quote = quoteCard.querySelector(".quote-card-quote");
        if (quote) {
          const bq = document2.createElement("blockquote");
          bq.append(el(document2, "p", quote.textContent.trim()));
          impact.push(bq);
        }
        const name = quoteCard.querySelector(".quote-card-author-name");
        if (name) {
          const p = document2.createElement("p");
          p.append(el(document2, "strong", name.textContent.trim()));
          impact.push(p);
        }
        const role = quoteCard.querySelector(".quote-card-author-subtext");
        if (role) impact.push(el(document2, "p", role.textContent.trim()));
      }
      const how = [];
      const listCard = panel.querySelector(".list-card");
      if (listCard) {
        const eyebrow = listCard.querySelector(".list-card-content__eyebrow");
        if (eyebrow) how.push(el(document2, "p", eyebrow.textContent.trim()));
        const ul = document2.createElement("ul");
        listCard.querySelectorAll("li").forEach((item) => {
          const text = [...item.childNodes].filter((n) => n.nodeType === 3 || n.nodeType === 1 && !n.matches(".len-icon, style, svg")).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
          if (!text) return;
          const li = document2.createElement("li");
          let img = item.querySelector("img");
          if (!img) {
            const src = iconUrl2(item, document2);
            if (src) {
              img = document2.createElement("img");
              img.src = /\.svg$/i.test(src) ? `${src}?icon` : src;
              img.alt = "";
            }
          }
          if (img) li.append(img, " ");
          li.append(text);
          ul.append(li);
        });
        if (ul.children.length) how.push(ul);
      }
      const stats = [];
      panel.querySelectorAll('.tab-card--stat, [class*="stat-card"]').forEach((stat, i, arr) => {
        if ([...arr].indexOf(stat) !== i) return;
        const value = stat.querySelector(".len-card__content-title, h5, h4, h3");
        const text = stat.querySelector(".len-card__content-text, p");
        if (value && value.textContent.trim()) stats.push(el(document2, "h4", value.textContent.trim()));
        if (text && text.textContent.trim()) stats.push(el(document2, "p", text.textContent.trim()));
      });
      if (!label && !intro.length) return;
      cells.push([
        label,
        intro.length ? intro : "",
        impact.length ? impact : "",
        how.length ? how : "",
        stats.length ? stats : ""
      ]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-casestudy", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/lenovo-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Header XF: <div class="cmp-experiencefragment cmp-experiencefragment--flash-header-experience-fragment">
        // contains nav.commonHeader, the rewards/deals promo strip
        // (section.x-cms-merchandizingbanner) and div.public-store-alert
        ".cmp-experiencefragment--flash-header-experience-fragment",
        "nav.commonHeader",
        ".commonHeaderPlaceHolder",
        "section.x-cms-merchandizingbanner",
        // Footer XF: <div class="cmp-experiencefragment cmp-experiencefragment--flash-footer-experience-fragment">
        // contains footer.commonFooter (+ iframe#footer_mask_iframe)
        ".cmp-experiencefragment--flash-footer-experience-fragment",
        "footer.commonFooter"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#INDWrap",
        // accessibility widget (INDmenu-btn, INDpopup, INDquickAccess)
        "#_evidon_banner",
        // cookie consent banner (evidon)
        "#inside_holder",
        // live chat (inside_liveChatTab) + lenovoSurveyWidget
        "#len-global-modal",
        // global video/iframe modal shell
        "#len-featured-merchandising-modal",
        // merchandising modal shell
        ".marketo-form-modal",
        // marketo form modal shell
        "#store-alert-pc",
        // empty store alert container
        "input#currentpage",
        // hidden input
        "#lenovoSurveyWidget"
        // floating "Feedback" survey launcher
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        '[id^="batBeacon"]',
        // bing UET beacon div + imgs
        'img[src*="bat.bing.com"]',
        "iframe#qualaroo_dnt_frame",
        "iframe"
        // doubleclick floodlight + empty tracking iframes; no authorable iframes on page
      ]);
      element.querySelectorAll(".htmlEmbed").forEach((embed) => {
        if (!embed.textContent.trim() && !embed.querySelector("img, picture, video, iframe, a")) {
          embed.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["div.divider.base-component"]);
      element.querySelectorAll(".card-grid__section-header :is(h3, h4, h5, h6)").forEach((heading) => {
        const h2 = element.ownerDocument.createElement("h2");
        h2.innerHTML = heading.innerHTML;
        heading.replaceWith(h2);
      });
      WebImporter.DOMUtils.remove(element, ["link", "noscript", "script", "style", "meta"]);
      element.querySelectorAll("[data-track], [onclick]").forEach((el2) => {
        el2.removeAttribute("data-track");
        el2.removeAttribute("onclick");
      });
    }
  }

  // tools/importer/transformers/lenovo-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el2 = null;
      try {
        el2 = root.querySelector(sel);
      } catch (e) {
        el2 = null;
      }
      if (el2) return el2;
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "carousel-hero": parse,
    "cards-category": parse2,
    "tabs-prompt": parse3,
    "cards-tile": parse4,
    "cards-icon": parse5,
    "columns-rewards": parse6,
    "tabs-casestudy": parse7
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_home_default = {
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
      const path = WebImporter.FileUtils.sanitizePath("/index");
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
  return __toCommonJS(import_home_exports);
})();
