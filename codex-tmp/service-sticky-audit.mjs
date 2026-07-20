const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(ws, method, params = {}) {
  const id = ++send.lastId;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      send.pending.delete(id);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 9000);
    send.pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)));
        return;
      }
      resolve(message.result);
    });
  });
}

send.lastId = 0;
send.pending = new Map();

const pages = [
  "residential-landscape-design.html",
  "commercial-landscape-design.html",
  "front-yard-design.html",
  "backyard-design.html",
  "garden-planting-plans.html",
  "patio-walkway-design.html",
  "outdoor-lighting.html",
  "3d-landscape-visualization.html",
];

async function openPage(path) {
  const pageResponse = await fetch(`http://127.0.0.1:9223/json/new?http://127.0.0.1:8008/${path}`, {
    method: "PUT",
  });
  const page = await pageResponse.json();
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const handler = send.pending.get(message.id);
    if (handler) {
      send.pending.delete(message.id);
      handler(message);
    }
  });
  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
  await send(ws, "Runtime.enable");
  await send(ws, "Page.enable");
  await send(ws, "Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send(ws, "Page.navigate", { url: `http://127.0.0.1:8008/${path}` });
  await sleep(1400);
  return { page, ws };
}

async function evaluate(ws, expression) {
  const result = await send(ws, "Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  return result.result.value;
}

async function audit(path) {
  const { page, ws } = await openPage(path);

  const initial = await evaluate(ws, `(() => {
    const section = document.querySelector('.service-stage-parallax');
    const sticky = document.querySelector('.service-detail-stages__sticky');
    const media = document.querySelector('.service-stage-parallax__media');
    const stickyStyle = getComputedStyle(sticky);
    return {
      path: ${JSON.stringify(path)},
      slug: document.body.dataset.serviceSlug,
      sectionOverflow: getComputedStyle(section).overflow,
      stickyPosition: stickyStyle.position,
      stickyTopRule: stickyStyle.top,
      stickyTop: Math.round(sticky.getBoundingClientRect().top),
      sectionTop: Math.round(section.getBoundingClientRect().top),
      mediaTransform: getComputedStyle(media).transform,
      stageCount: section.querySelectorAll('.service-stage').length
    };
  })()`);

  const scrollToInside = await evaluate(ws, `(() => {
    const section = document.querySelector('.service-stage-parallax');
    const target = Math.max(0, section.getBoundingClientRect().top + window.scrollY + 260);
    window.scrollTo({ top: target, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = target;
    return {
      target,
      scrollY: window.scrollY
    };
  })()`);
  await sleep(350);

  const inside = await evaluate(ws, `(() => {
    const section = document.querySelector('.service-stage-parallax');
    const sticky = document.querySelector('.service-detail-stages__sticky');
    const media = document.querySelector('.service-stage-parallax__media');
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 84;
    const expectedTop = Math.round(header + 24);
    return {
      stickyTop: Math.round(sticky.getBoundingClientRect().top),
      expectedTop,
      sectionTop: Math.round(section.getBoundingClientRect().top),
      sectionBottom: Math.round(section.getBoundingClientRect().bottom),
      mediaTransform: getComputedStyle(media).transform,
      isNearStickyTop: Math.abs(Math.round(sticky.getBoundingClientRect().top) - expectedTop) <= 3
    };
  })()`);

  const scrollMore = await evaluate(ws, `window.scrollBy(0, 220); window.scrollY`);
  await sleep(350);

  const after = await evaluate(ws, `(() => {
    const section = document.querySelector('.service-stage-parallax');
    const sticky = document.querySelector('.service-detail-stages__sticky');
    const media = document.querySelector('.service-stage-parallax__media');
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 84;
    const expectedTop = Math.round(header + 24);
    return {
      stickyTop: Math.round(sticky.getBoundingClientRect().top),
      expectedTop,
      sectionTop: Math.round(section.getBoundingClientRect().top),
      sectionBottom: Math.round(section.getBoundingClientRect().bottom),
      mediaTransform: getComputedStyle(media).transform,
      isNearStickyTop: Math.abs(Math.round(sticky.getBoundingClientRect().top) - expectedTop) <= 3
    };
  })()`);

  ws.close();
  await fetch(`http://127.0.0.1:9223/json/close/${page.id}`);
  return {
    ...initial,
    scrollToInside,
    scrollMore,
    inside,
    after,
    stickyWorked: initial.stickyPosition === "sticky" && inside.isNearStickyTop && after.isNearStickyTop,
    parallaxStillMoves: initial.mediaTransform !== inside.mediaTransform || inside.mediaTransform !== after.mediaTransform,
  };
}

const results = [];
for (const page of pages) {
  results.push(await audit(page));
}

console.log(JSON.stringify(results, null, 2));
