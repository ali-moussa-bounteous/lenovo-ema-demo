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

  // tools/importer/import-footer.js
  var import_footer_exports = {};
  __export(import_footer_exports, {
    default: () => import_footer_default
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
  var import_footer_default = {
    transform: ({ document, url }) => {
      const main = document.body;
      const footer = main.querySelector(".footer");
      if (!footer) return [];
      const result = document.createElement("div");
      const footerTop = footer.querySelector(".footer-top");
      if (footerTop) {
        const cols = footerTop.querySelectorAll(":scope > div");
        cols.forEach((col) => {
          const logoEl = col.querySelector(".footer-logo");
          if (logoEl) {
            const brandP = document.createElement("p");
            const brandA = document.createElement("a");
            brandA.href = rewriteHref("/");
            brandA.textContent = "WKND Adventures";
            brandP.appendChild(brandA);
            result.appendChild(brandP);
            const tagline = col.querySelector("p");
            if (tagline) {
              const tagP = document.createElement("p");
              tagP.textContent = tagline.textContent.trim();
              result.appendChild(tagP);
            }
          } else {
            const h4 = col.querySelector("h4");
            if (h4) {
              const heading = document.createElement("h4");
              heading.textContent = h4.textContent.trim();
              result.appendChild(heading);
            }
            const links = col.querySelectorAll("li a");
            if (links.length > 0) {
              const ul = document.createElement("ul");
              links.forEach((a) => {
                const li = document.createElement("li");
                const newA = document.createElement("a");
                newA.href = rewriteHref(a.getAttribute("href"));
                newA.textContent = a.textContent.trim();
                li.appendChild(newA);
                ul.appendChild(li);
              });
              result.appendChild(ul);
            }
          }
        });
      }
      result.appendChild(document.createElement("hr"));
      const footerBottom = footer.querySelector(".footer-bottom");
      if (footerBottom) {
        const paragraphs = footerBottom.querySelectorAll("p");
        paragraphs.forEach((p) => {
          const newP = document.createElement("p");
          newP.textContent = p.textContent.trim();
          result.appendChild(newP);
        });
      }
      return [{
        element: result,
        path: "/footer"
      }];
    }
  };
  return __toCommonJS(import_footer_exports);
})();
