import type { QuoteOffer } from "../types";

/**
 * The lowest amount a visitor can leave with for this offer.
 *
 * Kept separate from the formula prices because it is the number people
 * remember: it heads each block, and a formula added in the backoffice with a
 * lower floor must move it without anyone touching this page.
 */
export const offerEntryAmount = (offer: QuoteOffer): number =>
  offer.variants.reduce(
    (lowest, variant) => (variant.minimumAmount < lowest ? variant.minimumAmount : lowest),
    Number.POSITIVE_INFINITY,
  );

/**
 * Offers with no formula would print "à partir de ∞". They are dropped rather
 * than rendered empty: an offer whose grid is not filled in yet has no price to
 * announce, and a half-empty block reads as a mistake.
 */
export const priceableOffers = (offers: QuoteOffer[]): QuoteOffer[] =>
  offers.filter((offer) => offer.variants.length > 0);

/**
 * Cheapest first inside a block, so the entry price at the top is the first
 * formula listed and the reading order matches the number just announced.
 */
export const variantsByPrice = (offer: QuoteOffer): QuoteOffer["variants"] =>
  [...offer.variants].sort((a, b) => a.minimumAmount - b.minimumAmount);
