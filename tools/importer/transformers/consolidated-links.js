/* eslint-disable */
/* global WebImporter */
/**
 * Transformer: consolidated-links
 * Rewrites site-root links (/locations, /book-appointment?location=..., /) to AEM page paths
 * under the site root (/content/demosuveto/...), so they resolve in Universal Editor on AEM
 * author. paths.json maps /content/demosuveto/ back to / when pages are published.
 * Runs for every consolidated template, including nav and footer.
 */
const AEM_SITE_PATH = '/content/demosuveto';

export default function transform(hookName, element) {
  if (hookName !== 'afterTransform') return;

  element.querySelectorAll('a[href^="/"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('//') || href.startsWith(`${AEM_SITE_PATH}/`)) return;
    const [, path, rest] = href.match(/^([^?#]*)(.*)$/);
    const pagePath = path === '/' || path === '' ? '/index' : path.replace(/\/$/, '');
    a.setAttribute('href', `${AEM_SITE_PATH}${pagePath}${rest}`);
  });
}
