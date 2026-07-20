import { initServiceExplorer } from "../components/service-explorer.js";

export function initHome(config) {
  initServiceExplorer(config);
  initPlanningSteps();
  renderPlanningStepIcons();
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