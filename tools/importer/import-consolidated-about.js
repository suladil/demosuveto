/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import columnsMediaParser from './parsers/columns-media.js';
import columnsStatsParser from './parsers/columns-stats.js';
import columnsFeaturesParser from './parsers/columns-features.js';
import cardsStepsParser from './parsers/cards-steps.js';
import cleanupTransformer from './transformers/consolidated-cleanup.js';
import sectionsTransformer from './transformers/consolidated-sections.js';
import navFooterTransformer from './transformers/consolidated-nav-footer.js';

const PAGE_TEMPLATE = {
  name: 'consolidated-about',
  description: 'About page (/about) for the consolidated Paws & Partners site: split hero, our-story media columns, stats and values, milestone steps, leadership media columns and closing CTA. Source: migration-work/consolidation/source/about.html, served locally on port 4600 for import.',
  urls: [
    'http://localhost:4600/about.html',
  ],
  blocks: [
    { name: 'hero-split', instances: ['section.pp-hero'] },
    { name: 'columns-media', instances: ['section.pp-media'] },
    { name: 'columns-stats', instances: ['.pp-stats'] },
    { name: 'columns-features', instances: ['.pp-features'] },
    { name: 'cards-steps', instances: ['ol.pp-steps'] },
  ],
  sections: [
    { id: 'hero', name: 'Hero', selector: ['section.pp-hero'], style: null, blocks: ['hero-split'], defaultContent: [] },
    { id: 'story', name: 'Our story', selector: ['section.pp-story'], style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'values', name: 'What we stand for', selector: ['section.pp-why'], style: 'light, centered', blocks: ['columns-stats', 'columns-features'], defaultContent: ['.pp-why > .pp-eyebrow', '.pp-why > h2'] },
    { id: 'milestones', name: 'Our journey', selector: ['section.pp-milestones'], style: 'dark, centered', blocks: ['cards-steps'], defaultContent: ['.pp-milestones > .pp-eyebrow', '.pp-milestones > h2', '.pp-milestones > p'] },
    { id: 'people', name: 'Our people', selector: ['section.pp-people'], style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'closing', name: 'Closing CTA', selector: ['section.pp-closing'], style: 'light, centered', blocks: [], defaultContent: ['.pp-closing > .pp-eyebrow', '.pp-closing > h2', '.pp-closing > p'] },
  ],
};

const parsers = {
  'hero-split': heroSplitParser,
  'columns-media': columnsMediaParser,
  'columns-stats': columnsStatsParser,
  'columns-features': columnsFeaturesParser,
  'cards-steps': cardsStepsParser,
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
