/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { cardSizes as sizes } from '../support/component-shared';

const cards = sizes.map((size, i) => ({ size, i }));

describe('nb-flip-card', () => {
  beforeEach(() => {
    cy.visit('#/card/card-test.component');
  });

  cards.forEach((c) => {
    describe(`${c.size.sizeKey} flip card`, () => {
      it(`should show front card`, () => {
        const flipCard = `nb-flip-card:eq(${c.i})`;
        const frontCard = `${flipCard} .front-container:first`;

        cy.get(flipCard).should('not.have.class', 'flipped');
        cy.get(frontCard).should('be.visible');
      });
    });
  });
});
