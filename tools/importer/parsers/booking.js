/* eslint-disable */
/* global WebImporter */
/**
 * Parser: booking
 * Source: section.pp-booking (booking page built from the supplied booking prototype).
 * Output: Booking, 1 column - row 1: summary image, row 2: eyebrow, H1, intro text.
 * The steps themselves are rendered by blocks/booking/booking.js.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.pp-booking-media img, img');
  const introSrc = element.querySelector('.pp-booking-intro') || element;

  const intro = document.createElement('div');
  [...introSrc.children].forEach((child) => {
    if (child.contains(img)) return;
    intro.append(child);
  });

  const cells = [[img || ''], [intro]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Booking', cells });
  element.replaceWith(block);
}
