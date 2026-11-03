/* eslint-disable */
/* global WebImporter */
/**
 * Transformer: consolidated-cleanup
 * - Removes page chrome (header/footer are imported separately as nav/footer).
 * - Turns pp-btn-primary / pp-btn-secondary links into EDS buttons (strong / em wrappers).
 * - Turns icon spans into plain :icon: text so EDS renders /icons/<name>.svg.
 * Runs for content pages only; nav and footer keep the chrome they are built from.
 */
const CONTENT_TEMPLATES = ['consolidated-homepage', 'consolidated-locations', 'consolidated-location', 'consolidated-about', 'consolidated-booking'];

export default function transform(hookName, element, payload) {
  const templateName = payload && payload.template && payload.template.name;
  if (templateName && !CONTENT_TEMPLATES.includes(templateName)) return;

  if (hookName === 'beforeTransform') {
    element.querySelectorAll('header, footer, script, style, noscript, link').forEach((el) => el.remove());

    element.querySelectorAll('a.pp-btn-primary, a.pp-btn-secondary').forEach((a) => {
      const wrapper = element.ownerDocument.createElement(a.classList.contains('pp-btn-primary') ? 'strong' : 'em');
      a.replaceWith(wrapper);
      wrapper.append(a);
    });

    element.querySelectorAll('.pp-icon').forEach((span) => {
      span.replaceWith(element.ownerDocument.createTextNode(span.textContent.trim()));
    });
  }

  if (hookName === 'afterTransform') {
    element.querySelectorAll('[data-pattern]').forEach((el) => el.removeAttribute('data-pattern'));
  }
}
