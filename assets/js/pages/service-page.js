const escapeHtml = (value = "") => {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]
  );
};

export function initServicePage(config) {
  const slug = document.body.dataset.serviceSlug;

  if (!slug) {
    console.warn(
      "Verdeon: data-service-slug is missing."
    );

    return;
  }

  const services = Array.isArray(config?.services)
    ? config.services
    : [];

  const service = services.find((item) => {
    return item.slug === slug;
  });

  renderServiceRelatedShowcase(
    config.services,
    service
  );

  if (!service) {
    console.warn(
      `Verdeon: service "${slug}" was not found.`
    );

    return;
  }

  renderServiceBasics(service);
  renderServiceScope(service);
  renderServiceStages(service);
  renderServiceDeliverables(service);
  renderServiceFaq(service);

  /*
   * Новая универсальная секция.
   * Показывает все остальные сервисы,
   * но связанные сервисы ставит первыми.
   */
  renderRelatedServiceCarousel(
    services,
    service
  );
}



/* =========================================================
   BASIC SERVICE CONTENT
========================================================= */

function renderServiceBasics(service) {
  document
    .querySelectorAll("[data-service-title]")
    .forEach((node) => {
      node.textContent = service.title;
    });

  document
    .querySelectorAll("[data-service-summary]")
    .forEach((node) => {
      node.textContent = service.summary;
    });

  document
    .querySelectorAll("[data-service-image]")
    .forEach((node) => {
      node.src = service.image;
      node.alt =
        service.imageAlt ||
        service.title;
    });

  const overview = document.querySelector(
    "[data-service-overview]"
  );

  if (overview) {
    overview.textContent =
      service.overview || "";
  }
}


/* =========================================================
   SCOPE
========================================================= */

function renderServiceScope(service) {
  const container = document.querySelector(
    "[data-service-scope]"
  );

  if (!container) {
    return;
  }

  const items = Array.isArray(service.scope)
    ? service.scope
    : [];

  container.innerHTML = items
    .map((item, index) => {
      return `
        <article class="service-detail-scope__item">
          <span>
            ${String(index + 1).padStart(2, "0")}
          </span>

          <h3>${escapeHtml(item)}</h3>
        </article>
      `;
    })
    .join("");
}


/* =========================================================
   STAGES
========================================================= */

function renderServiceStages(service) {
  const container = document.querySelector(
    "[data-service-stages]"
  );

  if (!container) {
    return;
  }

  const items = Array.isArray(service.stages)
    ? service.stages
    : [];

  container.innerHTML = items
    .map((item, index) => {
      return `
        <article
          class="service-stage"
          data-stage-panel
        >
          <span>
            ${String(index + 1).padStart(2, "0")}
          </span>

          <div>
            <h3>${escapeHtml(item)}</h3>

            <p>
              Clarify this decision before moving
              to the next planning layer.
            </p>
          </div>
        </article>
      `;
    })
    .join("");
}


/* =========================================================
   DELIVERABLES
========================================================= */

function renderServiceDeliverables(service) {
  const container = document.querySelector(
    "[data-service-deliverables]"
  );

  if (!container) {
    return;
  }

  const items = Array.isArray(service.deliverables)
    ? service.deliverables
    : [];

  container.innerHTML = items
    .map((item, index) => {
      const panelId =
        `deliverable-${service.slug}-${index}`;

      return `
        <article class="v-accordion__item">
          <h3>
            <button
              class="v-accordion__button"
              type="button"
              aria-expanded="${index === 0}"
              aria-controls="${panelId}"
            >
              <span class="v-accordion__number">
                ${String(index + 1).padStart(2, "0")}
              </span>

              <span>
                ${escapeHtml(item.title)}
              </span>

              <span
                class="v-accordion__icon"
                aria-hidden="true"
              ></span>
            </button>
          </h3>

          <div
            class="v-accordion__panel"
            id="${panelId}"
          >
            <div>
              <p>${escapeHtml(item.text)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}


/* =========================================================
   FAQ
========================================================= */

function renderServiceFaq(service) {
  const container = document.querySelector(
    "[data-service-faq]"
  );

  if (!container) {
    return;
  }

  const items = Array.isArray(service.faq)
    ? service.faq
    : [];

  container.innerHTML = items
    .map((item, index) => {
      const panelId =
        `service-faq-${service.slug}-${index}`;

      return `
        <article class="v-accordion__item">
          <h3>
            <button
              class="v-accordion__button"
              type="button"
              aria-expanded="${index === 0}"
              aria-controls="${panelId}"
            >
              <span class="v-accordion__number">
                ${String(index + 1).padStart(2, "0")}
              </span>

              <span>
                ${escapeHtml(item.q)}
              </span>

              <span
                class="v-accordion__icon"
                aria-hidden="true"
              ></span>
            </button>
          </h3>

          <div
            class="v-accordion__panel"
            id="${panelId}"
          >
            <div>
              <p>${escapeHtml(item.a)}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}


/* =========================================================
   RELATED SERVICE CAROUSEL
========================================================= */

function renderRelatedServiceCarousel(
  services,
  currentService
) {
  const section = document.querySelector(
    "[data-service-related]"
  );

  if (!section) {
    return;
  }

  const list = section.querySelector(
    "[data-service-related-list]"
  );

  if (!list) {
    console.warn(
      "Verdeon: related service list was not found."
    );

    section.hidden = true;
    return;
  }

  const relatedServices =
    getOrderedRelatedServices(
      services,
      currentService
    );

  if (relatedServices.length === 0) {
    section.hidden = true;
    return;
  }

  list.replaceChildren(
    ...relatedServices.map((service) => {
      return createRelatedServiceSlide(service);
    })
  );

  section.hidden = false;

  initRelatedServiceSwiper(
    section,
    relatedServices.length
  );
}


/* =========================================================
   RELATED ORDER
========================================================= */

function getOrderedRelatedServices(
  services,
  currentService
) {
  const result = [];
  const addedSlugs = new Set();

  const addService = (service) => {
    if (!service?.slug) {
      return;
    }

    if (service.slug === currentService.slug) {
      return;
    }

    if (addedSlugs.has(service.slug)) {
      return;
    }

    result.push(service);
    addedSlugs.add(service.slug);
  };

  /*
   * Сначала добавляем сервисы,
   * указанные в currentService.related.
   */
  const relatedSlugs = Array.isArray(
    currentService.related
  )
    ? currentService.related
    : [];

  relatedSlugs.forEach((slug) => {
    const service = services.find((item) => {
      return item.slug === slug;
    });

    addService(service);
  });

  /*
   * Потом добавляем все оставшиеся сервисы.
   * В итоге в слайдере будет 7 сервисов,
   * а не только 3.
   */
  services.forEach(addService);

  return result;
}


/* =========================================================
   CREATE RELATED SLIDE
========================================================= */

function createRelatedServiceSlide(service) {
  const article = document.createElement(
    "article"
  );

  article.className =
    "service-related-card swiper-slide";

  const icon = document.createElement("span");

  icon.className =
    "service-related-card__icon";

  icon.setAttribute(
    "aria-hidden",
    "true"
  );

  icon.innerHTML = getServiceIconMarkup(
    service.slug
  );

  const title = document.createElement("h3");

  title.textContent =
    service.title;

  const description = document.createElement(
    "p"
  );

  description.textContent =
    service.summary ||
    "Explore this landscape planning direction.";

  const link = document.createElement("a");

  link.className =
    "service-related-card__link";

  link.href =
    service.url || "#";

  link.textContent =
    "View Service";

  link.setAttribute(
    "aria-label",
    `Explore ${service.title}`
  );

  article.append(
    icon,
    title,
    description,
    link
  );

  return article;
}


/* =========================================================
   RELATED SWIPER
========================================================= */

function initRelatedServiceSwiper(
  section,
  itemCount
) {
  const slider = section.querySelector(
    "[data-service-related-swiper]"
  );

  if (!slider) {
    return;
  }

  if (!window.Swiper) {
    section.classList.add(
      "service-related-carousel--static"
    );

    return;
  }

  /*
   * Защита от повторной инициализации.
   */
  if (slider.swiper) {
    slider.swiper.update();
    return;
  }

  new window.Swiper(slider, {
    slidesPerView: 1,
    spaceBetween: 18,
    speed: 650,
    loop: false,
    watchOverflow: true,
    grabCursor: itemCount > 1,
    allowTouchMove: itemCount > 1,

    keyboard: {
      enabled: true,
      onlyInViewport: true
    },

    navigation: {
      prevEl: section.querySelector(
        "[data-service-related-prev]"
      ),

      nextEl: section.querySelector(
        "[data-service-related-next]"
      )
    },

    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 20
      },

      960: {
        slidesPerView: 3,
        spaceBetween: 24
      },

      1280: {
        slidesPerView: 4,
        spaceBetween: 28
      }
    }
  });
}


/* =========================================================
   SERVICE ICONS
========================================================= */

function getServiceIconMarkup(slug) {
  const icons = {
    "residential-landscape-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 23 24 8l18 15"/>
        <path d="M10 21v20h28V21"/>
        <path d="M19 41V29h10v12"/>
        <path d="M7 41h34"/>
      </svg>
    `,

    "commercial-landscape-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M7 43V9h21v34"/>
        <path d="M28 18h13v25"/>
        <path d="M13 15h4"/>
        <path d="M13 22h4"/>
        <path d="M13 29h4"/>
        <path d="M33 24h3"/>
        <path d="M33 31h3"/>
        <path d="M4 43h40"/>
      </svg>
    `,

    "front-yard-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 42c6-12 14-19 25-25"/>
        <path d="M16 42c4-8 10-14 20-20"/>
        <path d="M32 8c6 0 10 4 10 10-6 0-10-4-10-10Z"/>
        <path d="M8 28c6 0 10 4 10 10-6 0-10-4-10-10Z"/>
      </svg>
    `,

    "backyard-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 42V22h32v20"/>
        <path d="M5 22h38"/>
        <path d="M12 22V11h24v11"/>
        <path d="M17 42V30h14v12"/>
        <path d="M4 42h40"/>
      </svg>
    `,

    "garden-planting-plans": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M24 42V20"/>
        <path d="M24 28c-9 0-14-5-14-13 9 0 14 5 14 13Z"/>
        <path d="M24 22c9 0 14-5 14-13-9 0-14 5-14 13Z"/>
        <path d="M14 42h20"/>
      </svg>
    `,

    "patio-walkway-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 42 19 8h10l11 34"/>
        <path d="M13 30h22"/>
        <path d="M16 20h16"/>
        <path d="M10 38h28"/>
      </svg>
    `,

    "outdoor-lighting": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M16 20a8 8 0 1 1 16 0c0 5-4 7-5 11h-6c-1-4-5-6-5-11Z"/>
        <path d="M21 36h6"/>
        <path d="M22 41h4"/>
        <path d="M24 4V1"/>
        <path d="M7 21H3"/>
        <path d="M45 21h-4"/>
      </svg>
    `,

    "3d-landscape-visualization": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m24 5 18 9-18 9-18-9 18-9Z"/>
        <path d="m6 23 18 9 18-9"/>
        <path d="m6 32 18 9 18-9"/>
        <path d="M24 23v18"/>
      </svg>
    `
  };

  return icons[slug] || `
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="24" cy="24" r="17"/>
      <path d="M24 15v18"/>
      <path d="M15 24h18"/>
    </svg>
  `;
}

/* =========================================================
   RELATED SERVICE SHOWCASE
========================================================= */

function renderServiceRelatedShowcase(
  services,
  currentService
) {
  const section = document.querySelector(
    "[data-service-related-showcase]"
  );

  if (!section) {
    return;
  }

  const container = section.querySelector(
    "[data-service-related-showcase-list]"
  );

  if (!container) {
    section.hidden = true;
    return;
  }

  const relatedServices = getShowcaseServices(
    services,
    currentService,
    3
  );

  if (relatedServices.length === 0) {
    section.hidden = true;
    return;
  }

  container.replaceChildren(
    ...relatedServices.map((service, index) => {
      return createRelatedShowcaseCard(
        service,
        index
      );
    })
  );

  section.hidden = false;

  requestAnimationFrame(() => {
    window.AOS?.refreshHard?.();
  });
}


/* =========================================================
   RELATED SERVICE SELECTION
========================================================= */

function getShowcaseServices(
  services,
  currentService,
  limit
) {
  const selected = [];
  const selectedSlugs = new Set();

  const addService = (service) => {
    if (!service?.slug) {
      return;
    }

    if (service.slug === currentService.slug) {
      return;
    }

    if (selectedSlugs.has(service.slug)) {
      return;
    }

    selected.push(service);
    selectedSlugs.add(service.slug);
  };

  const relatedSlugs = Array.isArray(
    currentService.related
  )
    ? currentService.related
    : [];

  /*
   * Сначала берём три направления из related.
   */
  relatedSlugs.forEach((slug) => {
    const relatedService = services.find(
      (service) => service.slug === slug
    );

    addService(relatedService);
  });

  /*
   * Подстраховка, если related содержит
   * меньше трёх существующих сервисов.
   */
  services.forEach((service) => {
    if (selected.length < limit) {
      addService(service);
    }
  });

  return selected.slice(0, limit);
}


/* =========================================================
   CREATE CARD
========================================================= */

function createRelatedShowcaseCard(
  service,
  index
) {
  const article = document.createElement(
    "article"
  );

  article.className =
    "service-related-showcase-card";

  if (index === 1) {
    article.classList.add(
      "service-related-showcase-card--featured"
    );
  }

  article.setAttribute(
    "data-aos",
    "fade-up"
  );

  article.setAttribute(
    "data-aos-delay",
    String(index * 90)
  );

  const icon = document.createElement("span");

  icon.className =
    "service-related-showcase-card__icon";

  icon.setAttribute(
    "aria-hidden",
    "true"
  );

  icon.innerHTML = getRelatedShowcaseIcon(
    service.slug
  );

  const title = document.createElement("h3");

  title.textContent =
    service.title;

  const description = document.createElement(
    "p"
  );

  description.textContent =
    service.summary ||
    "Explore this connected landscape planning direction.";

  const link = document.createElement("a");

  link.className =
    "service-related-showcase-card__link";

  link.href =
    service.url || "#";

  link.textContent =
    "View Service";

  link.setAttribute(
    "aria-label",
    `Explore ${service.title}`
  );

  article.append(
    icon,
    title,
    description,
    link
  );

  return article;
}


/* =========================================================
   ICONS
========================================================= */

function getRelatedShowcaseIcon(slug) {
  const icons = {
    "residential-landscape-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 23 24 8l18 15"/>
        <path d="M10 21v20h28V21"/>
        <path d="M19 41V29h10v12"/>
        <path d="M7 41h34"/>
      </svg>
    `,

    "commercial-landscape-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M7 43V9h21v34"/>
        <path d="M28 18h13v25"/>
        <path d="M13 15h4"/>
        <path d="M13 22h4"/>
        <path d="M13 29h4"/>
        <path d="M33 24h3"/>
        <path d="M33 31h3"/>
        <path d="M4 43h40"/>
      </svg>
    `,

    "front-yard-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M7 42c6-13 15-22 29-29"/>
        <path d="M15 42c5-9 11-15 22-22"/>
        <path d="M31 8c7 0 11 4 11 11-7 0-11-4-11-11Z"/>
        <path d="M8 27c6 0 10 4 10 10-6 0-10-4-10-10Z"/>
      </svg>
    `,

    "backyard-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 42V22h32v20"/>
        <path d="M5 22h38"/>
        <path d="M12 22V11h24v11"/>
        <path d="M17 42V30h14v12"/>
        <path d="M4 42h40"/>
      </svg>
    `,

    "garden-planting-plans": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M24 42V19"/>
        <path d="M24 29c-9 0-14-5-14-14 9 0 14 5 14 14Z"/>
        <path d="M24 23c9 0 14-5 14-14-9 0-14 5-14 14Z"/>
        <path d="M15 42h18"/>
      </svg>
    `,

    "patio-walkway-design": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 42 19 8h10l11 34"/>
        <path d="M13 30h22"/>
        <path d="M16 20h16"/>
        <path d="M10 38h28"/>
      </svg>
    `,

    "outdoor-lighting": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M16 20a8 8 0 1 1 16 0c0 5-4 7-5 11h-6c-1-4-5-6-5-11Z"/>
        <path d="M21 36h6"/>
        <path d="M22 41h4"/>
        <path d="M24 4V1"/>
        <path d="M7 21H3"/>
        <path d="M45 21h-4"/>
      </svg>
    `,

    "3d-landscape-visualization": `
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m24 5 18 9-18 9-18-9 18-9Z"/>
        <path d="m6 23 18 9 18-9"/>
        <path d="m6 32 18 9 18-9"/>
        <path d="M24 23v18"/>
      </svg>
    `
  };

  return icons[slug] || `
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="24" cy="24" r="17"/>
      <path d="M24 15v18"/>
      <path d="M15 24h18"/>
    </svg>
  `;
}