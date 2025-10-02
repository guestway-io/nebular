/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { colors, cardSizes as sizes } from '../support/component-shared';

let cards: any[] = [];

function prepareCards() {
  const result: any[] = [];

  let elementNumber: number = 1;
  for (const { colorKey, color } of colors) {
    for (const { sizeKey, height } of sizes) {
      result.push({
        size: sizeKey,
        height: height,
        colorKey,
        color,
        elementNumber,
      });
      elementNumber++;
    }
  }

  return result;
}

describe('nb-card', () => {
  before(() => {
    cards = prepareCards();
    cy.visit('#/card/card-test.component');
  });

  cards.forEach((c) => {
    it(`should display ${c.colorKey} card with ${c.size} size`, () => {
      cy.get(`nb-card:nth-child(${c.elementNumber})`).should('be.visible');
      cy.get(`nb-card:nth-child(${c.elementNumber}) > nb-card-header`).should('contain.text', 'Header');
    });
  });
});
