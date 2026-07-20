



const OLD_SITE = Object.freeze({
  brandName: "Verdeon",
  legalName: "Verdeon Design Network LLC",
  email: "support@verdeon.com",
  addressLine1: "1847 Cedar Grove Avenue, Suite 210",
  cityStateZip: "Portland, OR 97205",
  country: "United States"
});






const fallback = {
  siteIdentity: {
    ...OLD_SITE
  },

  brand: {
    name: OLD_SITE.brandName,
    tagline: "Plan Better Outdoors.",
    logoAlt: OLD_SITE.brandName,
    legalName: OLD_SITE.legalName
  },

  contact: {
    email: OLD_SITE.email,
    phoneDisplay: "",
    phoneRaw: "",
    addressLine1: OLD_SITE.addressLine1,
    cityStateZip: OLD_SITE.cityStateZip,
    country: OLD_SITE.country,
    mapHref: ""
  },

  navigation: [
    { label: "Home", url: "index.html" },
    { label: "About", url: "about.html" },
    {
      label: "Services",
      url: "all-services.html",
      dropdown: true
    },
    {
      label: "Project Gallery",
      url: "gallery.html"
    },
    { label: "Contact", url: "contact.html" }
  ],

  ctas: {
    consultation: "Request a Consultation",
    exploreServices: "Explore Design Services"
  },

  footer: {
    description:
      `${OLD_SITE.brandName} helps property owners explore landscape planning options.`,

    disclaimer:
      `${OLD_SITE.brandName} is an independent information and provider-matching platform.`,

    copyright:
      `© 2026 ${OLD_SITE.legalName}.`
  },

  legalLinks: [],
  services: [],

  cookie: {
    text:
      `${OLD_SITE.brandName} stores a small preference in your browser so this notice does not reappear.`,
    accept: "Accept",
    decline: "Decline",
    policyLabel: "Read Cookie Policy"
  }
};






const CONFIG_URL = new URL(
  "../../config/site.json",
  import.meta.url
);

async function loadConfig() {
  try {
    const response = await fetch(CONFIG_URL.href, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Config request failed: ${response.status}`
      );
    }

    const config = await response.json();

    return normalizeConfig(config);
  } catch (error) {
    console.error(
      "Verdeon: config/site.json was not loaded.",
      error
    );

    return normalizeConfig(fallback);
  }
}






function firstText(...values) {
  const value = values.find((item) => {
    return (
      typeof item === "string" &&
      item.trim().length > 0
    );
  });

  return value ? value.trim() : "";
}


function normalizeSiteIdentity(raw = {}) {
  const identity =
    raw.siteIdentity ||
    raw.identity ||
    {};

  return {
    brandName: firstText(
      identity.brandName,
      raw.brandName,
      raw.brand?.name,
      fallback.siteIdentity.brandName
    ),

    legalName: firstText(
      identity.legalName,
      raw.legalName,
      raw.brand?.legalName,
      fallback.siteIdentity.legalName
    ),

    email: firstText(
      identity.email,
      raw.email,
      raw.contact?.email,
      fallback.siteIdentity.email
    ),

    addressLine1: firstText(
      identity.addressLine1,
      raw.addressLine1,
      raw.contact?.addressLine1,
      fallback.siteIdentity.addressLine1
    ),

    cityStateZip: firstText(
      identity.cityStateZip,
      raw.cityStateZip,
      raw.contact?.cityStateZip,
      fallback.siteIdentity.cityStateZip
    ),

    country: firstText(
      identity.country,
      raw.country,
      raw.contact?.country,
      fallback.siteIdentity.country
    )
  };
}


function normalizeConfig(raw = {}) {
  const siteIdentity =
    normalizeSiteIdentity(raw);

  const config = {
    ...fallback,
    ...raw,

    siteIdentity,

    brand: {
      ...fallback.brand,
      ...(raw.brand || {}),
      name: siteIdentity.brandName,
      legalName: siteIdentity.legalName
    },

    contact: {
      ...fallback.contact,
      ...(raw.contact || {}),
      email: siteIdentity.email,
      addressLine1: siteIdentity.addressLine1,
      cityStateZip: siteIdentity.cityStateZip,
      country: siteIdentity.country
    },

    ctas: {
      ...fallback.ctas,
      ...(raw.ctas || {})
    },

    footer: {
      ...fallback.footer,
      ...(raw.footer || {})
    },

    cookie: {
      ...fallback.cookie,
      ...(raw.cookie || {})
    }
  };

  const replacedTextConfig =
    replaceConfigStrings(
      config,
      createReplacementPairsFromIdentity(
        siteIdentity
      )
    );

  const replacedConfig = {
    ...replacedTextConfig,

    siteIdentity,

    brand: {
      ...replacedTextConfig.brand,
      name: siteIdentity.brandName,
      legalName: siteIdentity.legalName
    },

    contact: {
      ...replacedTextConfig.contact,
      email: siteIdentity.email,
      addressLine1: siteIdentity.addressLine1,
      cityStateZip: siteIdentity.cityStateZip,
      country: siteIdentity.country
    }
  };

  const phoneRaw = String(
    replacedConfig.contact.phoneRaw ||
    replacedConfig.contact.phoneDisplay ||
    ""
  ).replace(/[^\d+]/g, "");

  const fullAddress = [
    replacedConfig.contact.addressLine1,
    replacedConfig.contact.cityStateZip,
    replacedConfig.contact.country
  ]
    .filter(Boolean)
    .join(", ");

  return {
    ...replacedConfig,

    contact: {
      ...replacedConfig.contact,

      phoneRaw,

      emailHref: replacedConfig.contact.email
        ? `mailto:${replacedConfig.contact.email}`
        : "",

      phoneHref: phoneRaw
        ? `tel:${phoneRaw}`
        : "",

      fullAddress,

      mapHref:
        replacedConfig.contact.mapHref ||
        (
          fullAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
            : ""
        )
    }
  };
}






function readPath(object, path) {
  if (!object || !path) {
    return undefined;
  }

  return String(path)
    .split(".")
    .reduce(
      (value, key) => value?.[key],
      object
    );
}


function findElements(root, selector) {
  const result = [];

  if (
    root?.nodeType === Node.ELEMENT_NODE &&
    root.matches(selector)
  ) {
    result.push(root);
  }

  if (root?.querySelectorAll) {
    result.push(
      ...root.querySelectorAll(selector)
    );
  }

  return result;
}


function createReplacementPairsFromIdentity(identity = {}) {
  return [
    [
      OLD_SITE.legalName,
      identity.legalName
    ],

    [
      OLD_SITE.addressLine1,
      identity.addressLine1
    ],

    [
      OLD_SITE.cityStateZip,
      identity.cityStateZip
    ],

    [
      OLD_SITE.email,
      identity.email
    ],

    [
      OLD_SITE.country,
      identity.country
    ],

    [
      OLD_SITE.brandName,
      identity.brandName
    ]
  ]
    .filter(([oldValue, newValue]) => {
      return (
        typeof oldValue === "string" &&
        oldValue.length > 0 &&
        typeof newValue === "string" &&
        newValue.length > 0 &&
        oldValue !== newValue
      );
    })
    .sort((a, b) => {
      return b[0].length - a[0].length;
    });
}


function createReplacementPairs(config) {
  return createReplacementPairsFromIdentity(
    config.siteIdentity ||
      {
        brandName: config.brand?.name,
        legalName: config.brand?.legalName,
        email: config.contact?.email,
        addressLine1: config.contact?.addressLine1,
        cityStateZip: config.contact?.cityStateZip,
        country: config.contact?.country
      }
  );
}


function replaceString(value, pairs) {
  if (typeof value !== "string") {
    return value;
  }

  if (!pairs.length) {
    return value;
  }

  const replacements = new Map(pairs);
  const pattern = new RegExp(
    pairs
      .map(([oldValue]) => {
        return oldValue.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
      })
      .join("|"),
    "g"
  );

  return value.replace(
    pattern,
    (match) => replacements.get(match) || match
  );
}


function replaceConfigStrings(value, pairs) {
  if (!pairs.length) {
    return value;
  }

  if (typeof value === "string") {
    return replaceString(value, pairs);
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      return replaceConfigStrings(item, pairs);
    });
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        return [
          key,
          replaceConfigStrings(item, pairs)
        ];
      })
    );
  }

  return value;
}






export function applyConfig(
  config,
  root = document
) {
  findElements(
    root,
    "[data-config-text]"
  ).forEach((node) => {
    const value = readPath(
      config,
      node.dataset.configText
    );

    if (
      typeof value !== "string" &&
      typeof value !== "number"
    ) {
      return;
    }





    if (node.children.length === 0) {
      node.textContent = String(value);
    }
  });


  findElements(
    root,
    "[data-config-href]"
  ).forEach((node) => {
    const value = readPath(
      config,
      node.dataset.configHref
    );

    if (typeof value === "string") {
      node.setAttribute("href", value);
    }
  });


  findElements(
    root,
    "[data-config-email]"
  ).forEach((node) => {
    const email = config.contact?.email;

    if (!email) {
      return;
    }

    if (node.children.length === 0) {
      node.textContent = email;
    }

    if (node.tagName === "A") {
      node.href = config.contact.emailHref;
    }
  });


  findElements(
    root,
    "[data-config-phone]"
  ).forEach((node) => {
    const phone =
      config.contact?.phoneDisplay;

    if (!phone) {
      return;
    }

    if (node.children.length === 0) {
      node.textContent = phone;
    }

    if (node.tagName === "A") {
      node.href = config.contact.phoneHref;
    }
  });
}









function replacePageText(root, pairs) {
  const startNode =
    root === document
      ? document.body
      : root;

  if (!startNode) {
    return;
  }

  const walker = document.createTreeWalker(
    startNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;

        if (!parent) {
          return NodeFilter.FILTER_REJECT;
        }

        if (
          parent.closest(
            [
              "script",
              "style",
              "noscript",
              "template",
              "code",
              "pre",
              "svg"
            ].join(",")
          )
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    const current = node.nodeValue;

    if (!current?.trim()) {
      return;
    }

    const updated = replaceString(
      current,
      pairs
    );

    if (updated !== current) {
      node.nodeValue = updated;
    }
  });
}






function replacePageAttributes(root, pairs) {
  const selector = [
    "[title]",
    "[aria-label]",
    "[alt]",
    "[placeholder]",
    "meta[content]"
  ].join(",");

  const attributes = [
    "title",
    "aria-label",
    "alt",
    "placeholder",
    "content"
  ];

  findElements(root, selector)
    .forEach((element) => {
      attributes.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) {
          return;
        }

        const current =
          element.getAttribute(attribute);

        const updated = replaceString(
          current,
          pairs
        );

        if (updated !== current) {
          element.setAttribute(
            attribute,
            updated
          );
        }
      });
    });
}






function updateContactLinks(config, root) {
  findElements(
    root,
    'a[href^="mailto:"]'
  ).forEach((link) => {
    const email = config.contact?.email;

    if (!email) {
      return;
    }

    link.href = config.contact.emailHref;

    const currentText =
      link.textContent.trim();

    if (
      currentText === OLD_SITE.email ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        currentText
      )
    ) {
      link.textContent = email;
    }
  });


  findElements(
    root,
    'a[href^="tel:"]'
  ).forEach((link) => {
    if (!config.contact?.phoneHref) {
      return;
    }

    link.href =
      config.contact.phoneHref;

    const currentText =
      link.textContent.trim();

    if (
      currentText === "" ||
      /^[+\d\s().-]+$/.test(currentText)
    ) {
      link.textContent =
        config.contact.phoneDisplay;
    }
  });


  findElements(
    root,
    [
      'a[href*="google.com/maps"]',
      'a[href*="maps.google"]',
      'a[href*="maps.apple"]'
    ].join(",")
  ).forEach((link) => {
    if (config.contact?.mapHref) {
      link.href =
        config.contact.mapHref;
    }
  });
}






function updateJsonLd(pairs) {
  document
    .querySelectorAll(
      'script[type="application/ld+json"]'
    )
    .forEach((script) => {
      script.textContent = replaceString(
        script.textContent,
        pairs
      );
    });
}






export function applySiteIdentity(
  config,
  root = document
) {
  if (!config) {
    return;
  }

  const pairs =
    createReplacementPairs(config);

  applyConfig(config, root);
  replacePageText(root, pairs);
  replacePageAttributes(root, pairs);
  updateContactLinks(config, root);

  document.title = replaceString(
    document.title,
    pairs
  );

  updateJsonLd(pairs);
}








export const configReady =
  loadConfig().then((config) => {
    window.VERDEON_CONFIG = config;

    document.dispatchEvent(
      new CustomEvent(
        "verdeon:config-ready",
        {
          detail: config
        }
      )
    );

    return config;
  });


window.VERDEON_CONFIG_READY =
  configReady;
