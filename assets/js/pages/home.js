import { initServiceExplorer } from "../components/service-explorer.js";

export function initHome(config) {
  initServiceExplorer(config);
  initPlanningSteps();
  initHomeFaqAccordion();
  renderPlanningStepIcons();
  initHomeServiceStack();
}

function initHomeServiceStack() {
  const slider = document.querySelector(
    "[data-home-service-stack]"
  );

  if (!slider || !window.Swiper) {
    return;
  }

  if (slider.dataset.initialized === "true") {
    return;
  }

  slider.dataset.initialized = "true";

  const section = slider.closest(".home-service-stack");

  const previousButton = section?.querySelector(
    "[data-home-service-stack-prev]"
  );

  const nextButton = section?.querySelector(
    "[data-home-service-stack-next]"
  );

  const pagination = section?.querySelector(
    "[data-home-service-stack-pagination]"
  );

  new window.Swiper(slider, {
    direction: "horizontal",
    slidesPerView: 1.08,
    spaceBetween: 16,
    speed: 720,
    loop: true,
    grabCursor: true,
    slideToClickedSlide: true,
    watchSlidesProgress: true,

    keyboard: {
      enabled: true,
      onlyInViewport: true
    },

    navigation: {
      prevEl: previousButton,
      nextEl: nextButton
    },

    pagination: {
      el: pagination,
      clickable: true
    },

    breakpoints: {
      0: {
        direction: "horizontal",
        slidesPerView: 1.06,
        spaceBetween: 14,
        centeredSlides: false
      },

      600: {
        direction: "horizontal",
        slidesPerView: 1.18,
        spaceBetween: 18,
        centeredSlides: true
      },

      1024: {
        direction: "vertical",
        slidesPerView: 3,
        spaceBetween: 18,
        centeredSlides: true
      }
    },

    on: {
      init() {
        if (
          window.lucide &&
          typeof window.lucide.createIcons === "function"
        ) {
          window.lucide.createIcons();
        }
      }
    }
  });
}

function initHomeFaqAccordion() {
  const accordion = document.querySelector(
    "[data-home-faq-accordion]"
  );

  if (!accordion) {
    return;
  }

  if (accordion.dataset.initialized === "true") {
    return;
  }

  accordion.dataset.initialized = "true";

  const buttons = Array.from(
    accordion.querySelectorAll(".home-faq__button")
  );

  const setItemState = (button, isOpen) => {
    const item = button.closest(".home-faq__item");

    const panelId = button.getAttribute("aria-controls");

    const panel = panelId
      ? document.getElementById(panelId)
      : null;

    if (!item || !panel) {
      return;
    }

    button.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    item.classList.toggle("is-open", isOpen);

    panel.setAttribute(
      "aria-hidden",
      String(!isOpen)
    );

    const icon = button.querySelector(
      ".v-accordion__icon"
    );

    if (icon) {
      icon.textContent = "";
    }
  };

  buttons.forEach((button) => {
    const isInitiallyOpen =
      button.getAttribute("aria-expanded") === "true";

    setItemState(button, isInitiallyOpen);

    button.addEventListener("click", () => {
      const wasOpen =
        button.getAttribute("aria-expanded") === "true";

      // Закрываем остальные карточки.
      buttons.forEach((otherButton) => {
        if (otherButton !== button) {
          setItemState(otherButton, false);
        }
      });

      // Текущую открываем или закрываем.
      setItemState(button, !wasOpen);
    });

    button.addEventListener("keydown", (event) => {
      const currentIndex = buttons.indexOf(button);

      let targetIndex = null;

      if (event.key === "ArrowDown") {
        targetIndex = (currentIndex + 1) % buttons.length;
      }

      if (event.key === "ArrowUp") {
        targetIndex =
          (currentIndex - 1 + buttons.length) %
          buttons.length;
      }

      if (event.key === "Home") {
        targetIndex = 0;
      }

      if (event.key === "End") {
        targetIndex = buttons.length - 1;
      }

      if (targetIndex === null) {
        return;
      }

      event.preventDefault();
      buttons[targetIndex].focus();
    });
  });
}

function initPlanningSteps() {
  const viewport = document.querySelector(
    "[data-planning-steps-viewport]"
  );

  const previousButton = document.querySelector(
    "[data-planning-steps-prev]"
  );

  const nextButton = document.querySelector(
    "[data-planning-steps-next]"
  );

  if (!viewport || !previousButton || !nextButton) {
    return;
  }

  // Не добавляем обработчики повторно,
  // если initHome случайно будет вызван ещё раз.
  if (viewport.dataset.planningStepsInitialized === "true") {
    return;
  }

  viewport.dataset.planningStepsInitialized = "true";

  const getScrollDistance = () => {
    const firstStep = viewport.querySelector(
      ".home-planning-step"
    );

    if (!firstStep) {
      return Math.max(viewport.clientWidth * 0.75, 240);
    }

    const track = viewport.querySelector(
      ".home-planning-steps__track"
    );

    const trackStyles = track
      ? window.getComputedStyle(track)
      : null;

    const gap = trackStyles
      ? Number.parseFloat(trackStyles.columnGap) || 0
      : 0;

    return firstStep.getBoundingClientRect().width + gap;
  };

  const updateControls = () => {
    const maximumScroll =
      viewport.scrollWidth - viewport.clientWidth;

    const currentScroll = Math.abs(viewport.scrollLeft);

    previousButton.disabled = currentScroll <= 4;
    nextButton.disabled =
      currentScroll >= maximumScroll - 4;
  };

  previousButton.addEventListener("click", () => {
    viewport.scrollBy({
      left: -getScrollDistance(),
      behavior: "smooth"
    });
  });

  nextButton.addEventListener("click", () => {
    viewport.scrollBy({
      left: getScrollDistance(),
      behavior: "smooth"
    });
  });

  viewport.addEventListener("scroll", updateControls, {
    passive: true
  });

  window.addEventListener("resize", updateControls);

  updateControls();
}

function renderPlanningStepIcons() {
  if (
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {
    window.lucide.createIcons();
  }
}
