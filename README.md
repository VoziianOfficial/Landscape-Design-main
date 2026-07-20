# Verdeon

Premium, responsive, multi-page website for Verdeon Design Network LLC, an independent landscape-design information and provider-matching platform.

## Run locally

The site fetches `config/site.json`, so it must be served over HTTP rather than opened directly with `file://`.

If PHP is installed:

```text
php -S 127.0.0.1:8080
```

Then open `http://127.0.0.1:8080/index.html`.

Any static server can be used for front-end review, but `contact.php` requires a PHP-capable server.

For a front-end-only preview on Windows without PHP:

```text
powershell -ExecutionPolicy Bypass -File tools/dev-server.ps1 -Port 8091
```

Then open `http://127.0.0.1:8091/index.html`. Stop the preview with `Ctrl+C`.

## Content configuration

`config/site.json` is the canonical editable source for:

- Brand and legal company information.
- Address and recipient email.
- Navigation and calls to action.
- All eight services, service-page content, images, FAQs, and related services.
- Footer and platform disclaimer.
- Contact-form options and messages.
- Advertise & Collaborate copy.
- Cookie notice copy.

`assets/js/config.js` loads this file, exposes `window.VERDEON_CONFIG` and `window.VERDEON_CONFIG_READY`, and preserves meaningful page fallbacks when the request fails.

`contact.php` reads the same JSON file for its recipient and allowed form values. Do not add a second hardcoded recipient.

## Contact form deployment

The hosting environment must support PHP 8.1 or newer and a correctly configured `mail()` transport. Many production hosts require SMTP rather than local mail delivery. If `mail()` is not configured, the endpoint intentionally returns an error and the browser preserves the visitor's useful input.

Recommended production work:

1. Configure a domain-authenticated sender for `no-reply@verdeon.com`.
2. Add SPF, DKIM, and DMARC records.
3. If the host does not provide reliable PHP mail, replace only the transport layer with an authenticated SMTP library while keeping validation and JSON responses intact.
4. Test success, mail failure, invalid email, missing consent, honeypot, expired timing, and disallowed select values.

## Front-end architecture

- Static semantic HTML for unique routes and metadata.
- Modular CSS with tokens, shared components, page styles, and deliberate responsive fallbacks.
- Vanilla ES modules for navigation, configuration, accordions, tabs, Swiper, AOS, sticky stages, parallax, cookie consent, filters, and form handling.
- One global AOS initialization.
- Pinned local Swiper 14.0.5 and AOS 2.3.4 assets.
- Native sticky positioning and IntersectionObserver; no scroll hijacking.
- Stacked mobile and reduced-motion fallbacks.

## Accessibility

The implementation includes skip links, semantic landmarks, one H1 per page, keyboard-accessible navigation, focus management, visible focus, accessible accordions and tabs, minimum control sizes, form labels, inline errors, `aria-live` status, descriptive image alternatives, and reduced-motion handling.

## Images

Production imagery is local WebP with fixed intrinsic dimensions. The homepage hero is the only photographic asset loaded eagerly. See `IMAGE-SOURCES.md` for provenance.

## Quality checks

Run the PowerShell audit from the project root:

```text
powershell -ExecutionPolicy Bypass -File tools/audit-site.ps1
```

The script checks required pages, empty links, duplicate IDs, HTML/CSS/JavaScript asset references, inline style blocks, image dimensions and alternatives, form labels, and JSON validity.
