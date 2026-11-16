/* eslint-disable */
/* global WebImporter */
/**
 * Parser: booking
 * Source: section.pp-booking (booking page built from the supplied booking prototype).
 * Output: Booking, 1 column - row 1: summary image, row 2: eyebrow, H1, intro text,
 * row 3 (optional): promotion banner (eyebrow, heading, text) from .pp-booking-promo,
 * row 4 (optional): promotion offer code from .pp-booking-promo-code.
 * The steps themselves are rendered by blocks/booking/booking.js.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.pp-booking-media img, img');
  const introSrc = element.querySelector('.pp-booking-intro') || element;
  const promoSrc = element.querySelector('.pp-booking-promo');
  const codeSrc = element.querySelector('.pp-booking-promo-code');

  const intro = document.createElement('div');
  [...introSrc.children].forEach((child) => {
    if (child.contains(img) || child === promoSrc || child === codeSrc) return;
    intro.append(child);
  });

  const cells = [[img || ''], [intro]];
  if (promoSrc) {
    const promo = document.createElement('div');
    [...promoSrc.children].forEach((child) => promo.append(child));
    const code = document.createElement('p');
    code.textContent = codeSrc ? codeSrc.textContent.trim() : '';
    cells.push([promo], [code]);
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'Booking', cells });
  element.replaceWith(block);
}
