/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsLocationsParser from './parsers/cards-locations.js';
import columnsFeaturesParser from './parsers/columns-features.js';
import columnsMediaParser from './parsers/columns-media.js';
import cleanupTransformer from './transformers/consolidated-cleanup.js';
import sectionsTransformer from './transformers/consolidated-sections.js';
import navFooterTransformer from './transformers/consolidated-nav-footer.js';

const PAGE_TEMPLATE = {
  name: 'consolidated-locations',
  description: 'Locations overview (/locations) for the consolidated Paws & Partners site: split hero with hospital chooser, location cards grouped by region (Downtown, North Shore), shared-care features, switch-hospitals teaser and closing CTA. Source: migration-work/consolidation/source/locations.html, served locally on port 4600 for import.',
  urls: [
    'http://localhost:4600/locations.html',
  ],
  blocks: [
    { name: 'hero-split', instances: ['section.pp-hero'] },
    { name: 'cards-locations', instances: ['.pp-location-list'] },
    { name: 'columns-features', instances: ['.pp-features'] },
    { name: 'columns-media', instances: ['section.pp-media'] },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: ['section.pp-hero'], style: null, blocks: ['hero-split'], defaultContent: [] },
    { id: 'downtown', name: 'Downtown hospitals', selector: ['section.pp-downtown'], style: 'centered', blocks: ['cards-locations'], defaultContent: ['.pp-downtown > .pp-eyebrow', '.pp-downtown > h2', '.pp-downtown > p'] },
    { id: 'north-shore', name: 'North Shore hospitals', selector: ['section.pp-north-shore'], style: 'light, centered', blocks: ['cards-locations'], defaultContent: ['.pp-north-shore > .pp-eyebrow', '.pp-north-shore > h2', '.pp-north-shore > p'] },
    { id: 'every-hospital', name: 'At every hospital', selector: ['section.pp-why'], style: 'centered', blocks: ['columns-features'], defaultContent: ['.pp-why > .pp-eyebrow', '.pp-why > h2'] },
    { id: 'switch', name: 'Book anywhere, switch anytime', selector: ['section.pp-switch'], style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'closing', name: 'Closing CTA', selector: ['section.pp-closing'], style: 'dark, centered', blocks: [], defaultContent: ['.pp-closing > .pp-eyebrow', '.pp-closing > h2', '.pp-closing > p'] },
  ],
};

const parsers = {
  'hero-split': heroSplitParser,
  'cards-locations': cardsLocationsParser,
  'columns-features': columnsFeaturesParser,
  'columns-media': columnsMediaParser,
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
