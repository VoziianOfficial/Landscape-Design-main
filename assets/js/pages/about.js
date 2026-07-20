export function initAbout(config) {
  initAboutFeedback(config);
  initAboutServiceStories(config);
}

function initAboutFeedback(config) {
  const section = document.querySelector(
    "[data-about-feedback]"
  );

  if (!section) {
    console.warn(
      "Verdeon: feedback section was not found."
    );
    return;
  }

  if (section.dataset.initialized === "true") {
    return;
  }

  const feedback =
    config?.aboutFeedback ||
    window.VERDEON_CONFIG?.aboutFeedback;

  const items = Array.isArray(feedback?.items)
    ? feedback.items.filter((item) => {
      return (
        typeof item?.quote === "string" &&
        item.quote.trim().length > 0
      );
    })
    : [];

  if (!feedback?.enabled || items.length === 0) {
    section.hidden = true;

    console.warn(
      "Verdeon: aboutFeedback is disabled or has no valid items."
    );

    return;
  }

  const list = section.querySelector(
    "[data-about-feedback-list]"
  );

  if (!list) {
    section.hidden = true;

    console.warn(
      "Verdeon: feedback swiper-wrapper was not found."
    );

    return;
  }

  setText(
    section.querySelector(
      "[data-about-feedback-eyebrow]"
    ),
    feedback.eyebrow
  );

  setText(
    section.querySelector(
      "[data-about-feedback-title]"
    ),
    feedback.title
  );

  setText(
    section.querySelector(
      "[data-about-feedback-intro]"
    ),
    feedback.intro
  );

  setText(
    section.querySelector(
      "[data-about-feedback-badge-title]"
    ),
    feedback.badgeTitle
  );

  setText(
    section.querySelector(
      "[data-about-feedback-badge-text]"
    ),
    feedback.badgeText
  );

  const image = section.querySelector(
    "[data-about-feedback-image]"
  );

  if (image && feedback.image) {
    image.src = feedback.image;
    image.alt = feedback.imageAlt || "";
  }

  /*
   * Создаём реальные swiper-slide из config.
   * Без этой строки wrapper остаётся пустым.
   */
  list.replaceChildren(
    ...items.map((item) => {
      return createFeedbackSlide(item);
    })
  );

  section.classList.toggle(
    "has-single-feedback",
    items.length <= 1
  );

  section.hidden = false;
  section.dataset.initialized = "true";

  initAboutFeedbackSwiper(
    section,
    items.length
  );
}

function createFeedbackSlide(item) {
  const slide = document.createElement("article");

  slide.className =
    "about-feedback__slide swiper-slide";

  const card = document.createElement("div");
  card.className = "about-feedback__card";

  const top = document.createElement("div");
  top.className = "about-feedback__card-top";

  const type = document.createElement("span");
  type.className = "about-feedback__type";
  type.textContent =
    item.role || "Verified Feedback";

  const quoteIcon = document.createElement("span");

  quoteIcon.className =
    "about-feedback__quote-icon";

  quoteIcon.setAttribute(
    "aria-hidden",
    "true"
  );

  quoteIcon.innerHTML = getQuoteIconMarkup();

  top.append(type, quoteIcon);

  const quote = document.createElement(
    "blockquote"
  );

  quote.textContent = item.quote;

  const author = document.createElement(
    "footer"
  );

  author.className =
    "about-feedback__author";

  author.append(
    createFeedbackAvatar(item),
    createFeedbackIdentity(item)
  );

  card.append(
    top,
    quote,
    author
  );

  slide.append(card);

  return slide;
}

function createFeedbackAvatar(item) {
  const avatar = document.createElement("span");

  avatar.className =
    "about-feedback__avatar";

  if (item.avatar) {
    const image = document.createElement("img");

    image.src = item.avatar;

    image.alt = item.name
      ? `${item.name} portrait`
      : "Feedback author";

    image.width = 64;
    image.height = 64;
    image.loading = "lazy";
    image.decoding = "async";

    avatar.append(image);

    return avatar;
  }

  const initials = String(
    item.name || "VF"
  )
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => {
      return part.charAt(0);
    })
    .join("")
    .toUpperCase();

  avatar.textContent = initials || "VF";

  return avatar;
}

function createFeedbackIdentity(item) {
  const identity = document.createElement(
    "span"
  );

  identity.className =
    "about-feedback__identity";

  const name = document.createElement(
    "strong"
  );

  name.textContent =
    item.name || "Verified contributor";

  const details = document.createElement(
    "span"
  );

  details.textContent = [
    item.role,
    item.location
  ]
    .filter(Boolean)
    .join(" · ");

  identity.append(name, details);

  return identity;
}

function initAboutFeedbackSwiper(
  section,
  itemCount
) {
  const slider = section.querySelector(
    "[data-about-feedback-swiper]"
  );

  if (!slider) {
    return;
  }

  /*
   * Swiper мог быть инициализирован
   * другим глобальным скриптом.
   */
  if (slider.swiper) {
    slider.swiper.update();
    return;
  }

  if (!window.Swiper) {
    console.warn(
      "Verdeon: Swiper library is unavailable."
    );

    section.classList.add(
      "about-feedback--static"
    );

    return;
  }

  if (
    slider.dataset.feedbackSwiperInitialized ===
    "true"
  ) {
    return;
  }

  slider.dataset.feedbackSwiperInitialized =
    "true";

  const hasMultipleSlides =
    itemCount > 1;

  new window.Swiper(slider, {
    slidesPerView: 1,
    spaceBetween: 24,
    speed: 680,
    loop: hasMultipleSlides,
    autoHeight: true,
    observer: true,
    observeParents: true,
    watchOverflow: true,
    grabCursor: hasMultipleSlides,
    allowTouchMove: hasMultipleSlides,

    keyboard: {
      enabled: hasMultipleSlides,
      onlyInViewport: true
    },

    navigation: hasMultipleSlides
      ? {
        prevEl: section.querySelector(
          "[data-about-feedback-prev]"
        ),

        nextEl: section.querySelector(
          "[data-about-feedback-next]"
        )
      }
      : false,

    pagination: hasMultipleSlides
      ? {
        el: section.querySelector(
          "[data-about-feedback-pagination]"
        ),

        clickable: true
      }
      : false,

    on: {
      init() {
        this.update();
      }
    }
  });
}

function setText(element, value) {
  if (
    element &&
    typeof value === "string" &&
    value.trim()
  ) {
    element.textContent = value;
  }
}

function initAboutServiceStories(config) {
  const container = document.querySelector(
    "[data-about-service-stories]"
  );

  if (!container) {
    return;
  }

  if (container.dataset.initialized === "true") {
    return;
  }

  const preferredSlugs = [
    "residential-landscape-design",
    "commercial-landscape-design",
    "3d-landscape-visualization"
  ];

  const services = Array.isArray(config?.services)
    ? preferredSlugs
      .map((slug) => {
        return config.services.find(
          (service) => service.slug === slug
        );
      })
      .filter(Boolean)
    : [];

  if (services.length === 0) {
    container.hidden = true;
    return;
  }

  const categories = {
    "residential-landscape-design": {
      label: "Residential",
      focus: "Whole-property planning"
    },

    "commercial-landscape-design": {
      label: "Commercial",
      focus: "Shared outdoor environments"
    },

    "3d-landscape-visualization": {
      label: "Visualization",
      focus: "2D & 3D design studies"
    }
  };

  container.replaceChildren(
    ...services.map((service, index) => {
      const meta = categories[service.slug] || {
        label: "Landscape Design",
        focus: "Planning direction"
      };

      return createAboutServiceStory(
        service,
        meta,
        index
      );
    })
  );

  container.dataset.initialized = "true";
  container.hidden = false;

  requestAnimationFrame(() => {
    if (
      window.AOS &&
      typeof window.AOS.refreshHard === "function"
    ) {
      window.AOS.refreshHard();
    }
  });
}

function createAboutServiceStory(
  service,
  meta,
  index
) {
  const article = document.createElement("article");

  article.className =
    "about-service-story";

  article.setAttribute(
    "data-aos",
    "fade-up"
  );

  article.setAttribute(
    "data-aos-delay",
    String(index * 90)
  );

  const link = document.createElement("a");

  link.className =
    "about-service-story__link";

  link.href = service.url;

  link.setAttribute(
    "aria-label",
    `Explore ${service.title}`
  );

  const media = document.createElement("figure");
  media.className = "about-service-story__media";

  const image = document.createElement("img");

  image.src = service.image;
  image.alt = service.imageAlt || service.title;
  image.width = 900;
  image.height = 620;
  image.loading = "lazy";
  image.decoding = "async";

  media.append(image);

  const body = document.createElement("div");
  body.className = "about-service-story__body";

  const metadata = document.createElement("div");
  metadata.className = "about-service-story__meta";

  const category = document.createElement("span");
  category.className =
    "about-service-story__category";

  category.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19V7l8-4 8 4v12"/>
      <path d="M8 21v-6h8v6"/>
      <path d="M3 21h18"/>
    </svg>
  `;

  const categoryText = document.createElement("span");
  categoryText.textContent = meta.label;

  category.append(categoryText);

  const focus = document.createElement("span");
  focus.className =
    "about-service-story__focus";

  focus.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 5h6l2 2h8v12H4V5Z"/>
    </svg>
  `;

  const focusText = document.createElement("span");
  focusText.textContent = meta.focus;

  focus.append(focusText);
  metadata.append(category, focus);

  const title = document.createElement("h3");
  title.textContent = service.title;

  const summary = document.createElement("p");
  summary.textContent = service.summary;

  const action = document.createElement("span");
  action.className =
    "about-service-story__action";

  action.innerHTML = `
    <span>View Planning Details</span>

    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14"/>
      <path d="m13 6 6 6-6 6"/>
    </svg>
  `;

  body.append(
    metadata,
    title,
    summary,
    action
  );

  link.append(media, body);
  article.append(link);

  return article;
}

function getQuoteIconMarkup() {
  return `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M8 11H5.5A2.5 2.5 0 0 1 8 8.5V7a4 4 0 0 0-4 4v6h4v-6Z"
      />
      <path
        d="M18 11h-2.5A2.5 2.5 0 0 1 18 8.5V7a4 4 0 0 0-4 4v6h4v-6Z"
      />
    </svg>
  `;
}