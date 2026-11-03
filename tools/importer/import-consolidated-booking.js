/* eslint-disable */
/* global WebImporter */

import bookingParser from './parsers/booking.js';
import cleanupTransformer from './transformers/consolidated-cleanup.js';
import sectionsTransformer from './transformers/consolidated-sections.js';
import navFooterTransformer from './transformers/consolidated-nav-footer.js';

const PAGE_TEMPLATE = {
  name: 'consolidated-booking',
  description: 'Book an Appointment page (/book-appointment) for the consolidated Paws & Partners site: a single Booking block (summary image + intro) whose four booking steps are rendered by the block code, following the supplied booking prototype. Source: migration-work/consolidation/source/book-appointment.html, served locally on port 4600 for import.',
  urls: [
    'http://localhost:4600/book-appointment.html',
  ],
  blocks: [
    { name: 'booking', instances: ['section.pp-booking'] },
  ],
  sections: [
    { id: 'booking', name: 'Booking', selector: ['section.pp-booking'], style: null, blocks: ['booking'], defaultContent: [] },
  ],
};

const parsers = {
  booking: bookingParser,
};

const transformers = [cleanupTransformer, sectionsTransformer, navFooterTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
