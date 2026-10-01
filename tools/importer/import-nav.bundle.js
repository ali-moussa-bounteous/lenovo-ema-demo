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

  // tools/importer/import-nav.js
  var import_nav_exports = {};
  __export(import_nav_exports, {
    default: () => import_nav_default
  });
  var BASE = "/";
  function rewriteHref(href) {
    if (!href) return href;
    try {
      const p = new URL(href, "https://wknd-adventures.com").pathname.replace(/\/$/, "").replace(/\.html$/, "").replace(/^\//, "");
      if (!p || p === "index") return BASE.slice(0, -1) + "/";
      return BASE + p;
    } catch {
      return href;
    }
  }
  var import_nav_default = {
    transform: ({ document, url }) => {
      const main = document.body;
      const navbar = main.querySelector(".navbar");
      if (!navbar) return [];
      const result = document.createElement("div");
      const logo = navbar.querySelector(".logo");
      const brandP = document.createElement("p");
      const brandA = document.createElement("a");
      brandA.href = rewriteHref(logo?.getAttribute("href") || "/");
      brandA.textContent = "WKND Adventures";
      brandP.appendChild(brandA);
      result.appendChild(brandP);
      result.appendChild(document.createElement("hr"));
      const topUl = document.createElement("ul");
      const menuItems = navbar.querySelectorAll(".nav-megamenu-item, .nav-menu-item");
      if (menuItems.length > 0) {
        menuItems.forEach((item) => {
          const trigger = item.querySelector(".nav-megamenu-trigger, .nav-menu-trigger, button");
          const label = trigger?.querySelector("span")?.textContent?.trim() || trigger?.textContent?.trim()?.replace(/\s+/g, " ") || "";
          const panel = item.querySelector(".nav-megamenu");
          const topLi = document.createElement("li");
          topLi.textContent = label;
          if (panel) {
            const links = panel.querySelectorAll("a");
            if (links.length > 0) {
              const regularLinks = [...links].filter((a) => !a.classList.contains("nav-megamenu-article"));
              const articleLinks = [...links].filter((a) => a.classList.contains("nav-megamenu-article"));
              const subUl = document.createElement("ul");
              regularLinks.forEach((a) => {
                const li = document.createElement("li");
                const newA = document.createElement("a");
                newA.href = rewriteHref(a.getAttribute("href"));
                const titleEl = a.querySelector('[class*="title"]');
                const descEl = a.querySelector('[class*="desc"]');
                newA.textContent = titleEl?.textContent?.trim() || a.textContent?.trim()?.split("\n")[0];
                li.appendChild(newA);
                if (descEl) {
                  const br = document.createElement("br");
                  li.appendChild(br);
                  li.appendChild(document.createTextNode(descEl.textContent.trim()));
                }
                subUl.appendChild(li);
              });
              topLi.appendChild(subUl);
              if (articleLinks.length > 0) {
                const artUl = document.createElement("ul");
                const artContainer = document.createElement("li");
                const sectionLabel = panel.querySelector('[class*="label"]');
                artContainer.textContent = sectionLabel?.textContent?.trim() || "Recent from the Field";
                const artSubUl = document.createElement("ul");
                articleLinks.forEach((a) => {
                  const li = document.createElement("li");
                  const newA = document.createElement("a");
                  newA.href = rewriteHref(a.getAttribute("href"));
                  const titleEl = a.querySelector('[class*="title"]');
                  const descEl = a.querySelector('[class*="desc"]');
                  newA.textContent = titleEl?.textContent?.trim() || a.textContent?.trim()?.split("\n")[0];
                  li.appendChild(newA);
                  if (descEl) {
                    const br = document.createElement("br");
                    li.appendChild(br);
                    li.appendChild(document.createTextNode(descEl.textContent.trim()));
                  }
                  artSubUl.appendChild(li);
                });
                artContainer.appendChild(artSubUl);
                artUl.appendChild(artContainer);
                topLi.appendChild(artUl);
              }
            }
          }
          topUl.appendChild(topLi);
        });
      } else {
        const allLinks = navbar.querySelectorAll("a.nav-megamenu-link, a.nav-megamenu-article");
        console.log("Nav: no .nav-menu-item found, using static link fallback");
      }
      result.appendChild(topUl);
      result.appendChild(document.createElement("hr"));
      const subLink = navbar.querySelector(".button, .nav-subscribe");
      if (subLink) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        const a = document.createElement("a");
        a.href = rewriteHref(subLink.getAttribute("href"));
        a.textContent = subLink.textContent.trim().replace(/\s+/g, " ");
        strong.appendChild(a);
        p.appendChild(strong);
        result.appendChild(p);
      }
      return [{
        element: result,
        path: "/nav"
      }];
    }
  };
  return __toCommonJS(import_nav_exports);
})();
