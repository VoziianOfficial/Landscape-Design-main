import {
  configReady,
  applySiteIdentity
} from "./config.js";

import {
  renderHeader,
  renderFooter
} from "./components/header.js";

import {
  initMobileMenu
} from "./components/mobile-menu.js";

import {
  initAOS,
  refreshAOS
} from "./components/aos.js";

import {
  initAccordions
} from "./components/accordions.js";

import {
  initTabs
} from "./components/tabs.js";

import {
  initSwipers
} from "./components/swipers.js";

import {
  initStickyStages
} from "./components/sticky-stage.js";

import {
  initParallax
} from "./components/parallax.js";

import {
  initCookieConsent
} from "./components/cookie-consent.js";


document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");


async function init() {
  try {
    const config = await configReady;

    /*
     * Сначала создаём header и footer.
     */
    renderHeader(config);
    renderFooter(config);

    initMobileMenu();
    initCookieConsent(config);

    /*
     * Потом создаём динамический контент страницы.
     */
    const page =
      document.body.dataset.page;

    if (page === "home") {
      const { initHome } = await import(
        "./pages/home.js"
      );

      initHome(config);
    }

    if (page === "about") {
      const { initAbout } = await import(
        "./pages/about.js"
      );

      initAbout(config);
    }

    if (page === "service-detail") {
      const { initServicePage } = await import(
        "./pages/service-page.js"
      );

      initServicePage(config);
    }

    if (page === "gallery") {
      const { initGallery } = await import(
        "./pages/gallery.js"
      );

      initGallery(config);
    }

    if (page === "contact") {
      const { initContact } = await import(
        "./pages/contact.js"
      );

      initContact(config);
    }

    /*
     * Один безопасный проход.
     * Никаких повторных observer и requestAnimationFrame.
     */
    applySiteIdentity(
      config,
      document
    );

    /*
     * Инициализируем компоненты только после
     * завершения генерации контента.
     */
    initAccordions();
    initTabs();
    initSwipers();
    initStickyStages();
    initParallax();

    initAOS();
    refreshAOS();
  } catch (error) {
    console.error(
      "Verdeon initialization failed:",
      error
    );
  }
}


init();