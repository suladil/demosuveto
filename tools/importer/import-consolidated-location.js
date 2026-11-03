/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import columnsFeaturesParser from './parsers/columns-features.js';
import cardsIconParser from './parsers/cards-icon.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsTestimonialsParser from './parsers/cards-testimonials.js';
import cleanupTransformer from './transformers/consolidated-cleanup.js';
import sectionsTransformer from './transformers/consolidated-sections.js';
import navFooterTransformer from './transformers/consolidated-nav-footer.js';

const PAGE_TEMPLATE = {
  name: 'consolidated-location',
  description: 'Hospital detail pages (/locations/<hospital>) for the consolidated Paws & Partners site: split hero with booking CTAs and links to the other hospitals, visit details (address, hours, contact), services at the hospital, hospital team, reviews and a booking section (#book-at-<hospital>). Source: migration-work/consolidation/source/locations/*.html, served locally on port 4600 for import.',
  urls: [
    'http://localhost:4600/locations/riverside.html',
    'http://localhost:4600/locations/old-town.html',
    'http://localhost:4600/locations/lakeview.html',
    'http://localhost:4600/locations/northgate.html',
  ],
  blocks: [
    { name: 'hero-split', instances: ['section.pp-hero'] },
    { name: 'columns-features', instances: ['.pp-features'] },
    { name: 'cards-icon', instances: ['.pp-service-list'] },
    { name: 'columns-media', instances: ['section.pp-media'] },
    { name: 'cards-testimonials', instances: ['.pp-review-list'] },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: ['section.pp-hero'], style: null, blocks: ['hero-split'], defaultContent: [] },
    { id: 'visit', name: 'Visit details', selector: ['section.pp-visit'], style: 'centered', blocks: ['columns-features'], defaultContent: ['.pp-visit > .pp-eyebrow', '.pp-visit > h2'] },
    { id: 'services', name: 'Services at this hospital', selector: ['section.pp-services'], style: 'light, centered', blocks: ['cards-icon'], defaultContent: ['.pp-services > .pp-eyebrow', '.pp-services > h2', '.pp-services > p'] },
    { id: 'team', name: 'Hospital team', selector: ['section.pp-team'], style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'reviews', name: 'Reviews', selector: ['section.pp-reviews'], style: 'light, centered', blocks: ['cards-testimonials'], defaultContent: ['.pp-reviews > .pp-eyebrow', '.pp-reviews > h2'] },
    { id: 'book', name: 'Book at this hospital', selector: ['section.pp-closing'], style: 'dark, centered', blocks: [], defaultContent: ['.pp-closing > .pp-eyebrow', '.pp-closing > h2', '.pp-closing > p'] },
  ],
};

const parsers = {
  'hero-split': heroSplitParser,
  'columns-features': columnsFeaturesParser,
  'cards-icon': cardsIconParser,
  'columns-media': columnsMediaParser,
  'cards-testimonials': cardsTestimonialsParser,
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
