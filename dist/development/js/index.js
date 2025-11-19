(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const iconSvg = "data:image/svg+xml,%3csvg%20width='60'%20height='79'%20viewBox='0%200%2060%2079'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20fill-rule='evenodd'%20clip-rule='evenodd'%20d='M35.2807%2072.0633C45.8137%2059.7683%2059.1297%2044.2211%2059.1297%2030.2389C59.1297%2013.5407%2045.8925%200%2029.5648%200C13.2372%200%200%2013.5407%200%2030.2389C0%2044.2211%2013.316%2059.7683%2023.849%2072.0633C25.8988%2074.4601%2027.8461%2076.7267%2029.5648%2078.8396C31.2836%2076.7267%2033.2309%2074.4601%2035.2807%2072.0633ZM29.5648%2039.4198C30.9884%2039.4198%2032.3981%2039.1394%2033.7133%2038.5946C35.0285%2038.0498%2036.2236%2037.2513%2037.2302%2036.2447C38.2368%2035.2381%2039.0353%2034.043%2039.5801%2032.7278C40.1249%2031.4126%2040.4053%2030.0029%2040.4053%2028.5794C40.4053%2027.1558%2040.1249%2025.7461%2039.5801%2024.4309C39.0353%2023.1157%2038.2368%2021.9206%2037.2302%2020.914C36.2236%2019.9074%2035.0285%2019.1089%2033.7133%2018.5641C32.3981%2018.0193%2030.9884%2017.7389%2029.5648%2017.7389C26.6898%2017.7389%2023.9325%2018.881%2021.8995%2020.914C19.8665%2022.947%2018.7244%2025.7043%2018.7244%2028.5794C18.7244%2031.4544%2019.8665%2034.2117%2021.8995%2036.2447C23.9325%2038.2777%2026.6898%2039.4198%2029.5648%2039.4198Z'%20fill='%23CF2703'/%3e%3c/svg%3e";
gsap.registerPlugin(ScrollTrigger, Draggable);
if (navigator.userAgent.indexOf("Mac") > 0) {
  $("html").addClass("mac");
}
class ModalPlugin extends Scrollbar.ScrollbarPlugin {
  static pluginName = "modal";
  static defaultOptions = {
    open: false
  };
  transformDelta(delta) {
    return this.options.open ? { x: 0, y: 0 } : delta;
  }
}
class SoftScrollPlugin extends Scrollbar.ScrollbarPlugin {
  static pluginName = "SoftScroll";
  transformDelta(delta, fromEvent) {
    const dirX = delta.x > 0 ? 1 : -1;
    const dirY = delta.y > 0 ? 1 : -1;
    if (dirX === this.lockX || dirY === this.lockY) {
      return { x: 0, y: 0 };
    } else {
      this.lockX = null;
      this.lockY = null;
    }
    return delta;
  }
  onRender(Data2d) {
    const { x, y } = Data2d;
    if (y < 0 && !this.lockY && Math.abs(y) >= this.scrollbar.scrollTop) {
      this.scrollbar.setMomentum(0, -this.scrollbar.scrollTop);
      this.lockY = -1;
    }
    if (x < 0 && !this.lockX && Math.abs(x) >= this.scrollbar.scrollLeft) {
      this.scrollbar.setMomentum(-this.scrollbar.scrollLeft, 0);
      this.lockX = -1;
    }
    if (x > 0 && !this.lockX && Math.abs(x) >= this.scrollbar.limit.x - this.scrollbar.scrollLeft) {
      this.scrollbar.setMomentum(this.scrollbar.limit.x - this.scrollbar.scrollLeft, 0);
      this.lockX = 1;
    }
    if (y > 0 && !this.lockY && Math.abs(y) >= this.scrollbar.limit.y - this.scrollbar.scrollTop) {
      this.scrollbar.setMomentum(0, this.scrollbar.limit.y - this.scrollbar.scrollTop);
      this.lockY = 1;
    }
    if (y === 0) this.lockY = null;
    if (x === 0) this.lockX = null;
  }
}
let deltaScaleX = 1;
let deltaScaleY = 1;
function detectBrowser() {
  let result = "Other";
  if (navigator.userAgent.indexOf("YaBrowser") !== -1) {
    result = "Yandex";
  } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
    result = "Firefox";
  } else if (navigator.userAgent.indexOf("MSIE") !== -1) {
    result = "Exploder";
  } else if (navigator.userAgent.indexOf("Edge") !== -1) {
    result = "Edge";
  } else if (navigator.userAgent.indexOf("Safari") !== -1) {
    result = "Safari";
  } else if (navigator.userAgent.indexOf("Opera") !== -1) {
    result = "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") !== -1) {
    result = "Chrome";
  }
  if (result !== "Firefox") {
    deltaScaleX = 1.3;
    deltaScaleY = 1.3;
  } else {
    deltaScaleX = 1;
    deltaScaleY = 1;
  }
  if ($("html").hasClass("mobile")) {
    deltaScaleX = 0.75;
    deltaScaleY = 0.75;
  }
}
detectBrowser();
class ScaleDeltaPlugin extends Scrollbar.ScrollbarPlugin {
  static pluginName = "scaleDelta";
  transformDelta(delta, fromEvent) {
    return {
      x: delta.x * deltaScaleX,
      y: delta.y * deltaScaleY
    };
  }
}
Scrollbar.use(ModalPlugin, SoftScrollPlugin, ScaleDeltaPlugin);
const images = gsap.utils.toArray("img");
const showDemo = () => {
  $("html").addClass("ready");
  $(".scroll-container").animate({ scrollTop: 0 }, 0);
  setTimeout(function() {
    ready();
  }, 100);
};
imagesLoaded(images).on("always", showDemo);
const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
  ScrollTrigger.refresh();
};
appHeight();
window.addEventListener("pageshow", () => {
  setTimeout(function() {
    appHeight();
  }, 0);
});
window.addEventListener("resize", () => {
  appHeight();
}, false);
window.addEventListener("orientationchange", () => {
  appHeight();
}, false);
let bodyScrollBar;
bodyScrollBar = Scrollbar.init(document.querySelector(".scroll-container"), {
  damping: 0.05,
  thumbMinSize: 50,
  syncCallbacks: true
});
ScrollTrigger.scrollerProxy(".scroll-container", {
  scrollTop(value) {
    if (arguments.length) {
      bodyScrollBar.scrollTop = value;
    }
    return bodyScrollBar.scrollTop;
  }
});
bodyScrollBar.addListener(ScrollTrigger.update);
$(document).on("click", ".scroll-top", function(e) {
  bodyScrollBar.scrollTo(0, 0, 2e3);
  e.preventDefault();
});
let topOffset, scrollToId, scrollToHere;
$(document).on("click", ".scroll-to", function(e) {
  scrollToId = $(this).attr("href");
  if ($(this).hasClass("scoll-header")) {
    topOffset = document.querySelector(".header").offsetHeight;
  } else if ($(this).attr("data-to")) {
    topOffset = document.querySelector(scrollToId).getBoundingClientRect().top - document.querySelector("." + $(this).attr("data-to")).getBoundingClientRect().top;
  } else {
    topOffset = 0;
  }
  scrollToHere = document.querySelector(scrollToId).offsetTop - topOffset;
  bodyScrollBar.scrollTo(0, scrollToHere, 2e3);
  e.preventDefault();
});
ScrollTrigger.defaults({ scroller: ".scroll-container", force3D: false });
function ready() {
  bodyScrollBar.update();
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-t-1]",
      start: "top bottom",
      toggleActions: "play none none none",
      // играть только при onEnter
      once: true
      // сработать один раз и удалиться
    }
  });
  tl1.to("[data-t-1] [data-a-1]", {
    y: "-10%",
    autoAlpha: 1,
    duration: 0.6
  }).to("[data-t-1] [data-a-1]", {
    y: "0%",
    duration: 0.4
  }).to("[data-t-1] [data-a-2]", {
    y: "0%",
    autoAlpha: 1,
    duration: 0.6
  }).to("[data-t-1] [data-a-3]", {
    y: "10%",
    autoAlpha: 1,
    duration: 0.6
  }).to("[data-t-1] [data-a-4]", {
    y: "0%",
    autoAlpha: 1,
    duration: 0.6
  }).to("[data-t-1] [data-a-5]", {
    y: "-5%",
    autoAlpha: 1,
    duration: 0.4
  }).to("[data-t-1] [data-a-5]", {
    y: "0%",
    duration: 0.3
  }).to("[data-t-1] [data-a-6]", {
    x: () => {
      if (window.innerWidth >= 1441) return "17.9%";
      if (window.innerWidth >= 320) return "19.7%";
      return "0%";
    },
    autoAlpha: 1,
    duration: 0.6
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-t-2]",
      start: "top bottom",
      toggleActions: "play none none none",
      once: true
    }
  });
  tl2.to("[data-t-2]", {
    margin: "10px 0",
    duration: 0.5
  }).to("[data-t-2] [data-a-2]", {
    y: "0%",
    autoAlpha: 1,
    duration: 0.6
  }, "+=1").to("[data-t-2] [data-a-3-1]", {
    x: "0%",
    duration: 0.6
  }).to("[data-t-2] [data-a-3-2]", {
    x: "0%",
    y: "0%",
    duration: 0.6
  }, "<");
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-t-3]",
      start: "top bottom",
      toggleActions: "play none none none",
      once: true
    }
  });
  tl3.to("[data-t-3] [data-a-1]", {
    y: "0%",
    autoAlpha: 1,
    duration: 0.6
  }, "+=0.1").to("[data-t-3] [data-a-2-1]", {
    x: "0%",
    duration: 0.6
  }).to("[data-t-3] [data-a-2-2]", {
    x: "0%",
    duration: 0.6
  }, "<");
  const tl4 = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-t-4]",
      start: "top bottom",
      toggleActions: "play none none none",
      once: true
    }
  });
  tl4.to("[data-t-4] [data-a-mob]", {
    autoAlpha: 1,
    marginLeft: 0,
    duration: 0.6
  }).to("[data-t-4] [data-a-1]", {
    scale: 1,
    duration: 0.6
  }).to("[data-t-4] [data-a-2]", {
    x: "0%",
    duration: 0.6
  }).to("[data-t-4] [data-a-3]", {
    y: "0%",
    autoAlpha: 1,
    duration: 0.6
  }, "+=0.1");
  ScrollTrigger.refresh();
}
(($2) => {
  const SELECTOR = ".header";
  const VAR_NAME = "--header-height";
  function setHeaderVar(el) {
    if (!el) return;
    const style = getComputedStyle(el);
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const borderBottom = parseFloat(style.borderBottomWidth) || 0;
    let h = el.clientHeight + borderTop + borderBottom;
    if (!h) h = Math.round(el.getBoundingClientRect().height) || 0;
    el.style.setProperty(VAR_NAME, `${h}px`);
    document.documentElement.style.setProperty(VAR_NAME, `${h}px`);
  }
  let $headers = $2();
  function collectHeaders() {
    $headers = $2(SELECTOR);
  }
  function updateAll() {
    if (!$headers.length) collectHeaders();
    $headers.each((_, el) => setHeaderVar(el));
  }
  let ro = null;
  function observe() {
    if (ro || typeof ResizeObserver === "undefined") return;
    ro = new ResizeObserver((entries) => {
      for (const entry of entries) setHeaderVar(entry.target);
    });
    $headers.each((_, el) => ro.observe(el));
  }
  function init2() {
    collectHeaders();
    if (!$headers.length) return;
    updateAll();
    observe();
  }
  $2(() => init2());
  $2(window).on("resize", () => updateAll());
  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
    document.fonts.ready.then(() => updateAll());
  }
  $2(window).one("load", () => {
    collectHeaders();
    updateAll();
  });
  window.updateHeaderHeightVar = updateAll;
})(jQuery);
ymaps.ready(init);
function init() {
  const centerMap = [55.741146, 37.593462];
  const myMap = new ymaps.Map("map", {
    center: centerMap,
    zoom: 17,
    type: "yandex#map",
    controls: []
  });
  const myPlacemark = new ymaps.Placemark(centerMap, {
    hintContent: "Посмотреть на Яндекс.Картах"
  }, {
    iconLayout: "default#image",
    iconImageHref: iconSvg,
    iconImageSize: [43, 60],
    iconImageOffset: [25, -82]
  });
  myPlacemark.events.add("click", function() {
    const url = `https://yandex.ru/maps?pt=${centerMap[1]},${centerMap[0]}&z=17&l=map`;
    window.open(url, "_blank");
  });
  myMap.geoObjects.add(myPlacemark);
  myMap.controls.add("zoomControl", { size: "small" });
  myMap.behaviors.disable("scrollZoom");
  myMap.behaviors.disable("drag");
  setTimeout(() => {
    myMap.container.fitToViewport();
  }, 100);
}
