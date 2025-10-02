/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { cardSizes as sizes } from '../support/component-shared';

function toInt(cssValue: string): number {
  return parseInt(cssValue, 10);
}

const cards = sizes.map((size, i) => ({
  size,
  i,
}));

describe('nb-reveal-card', () => {
  beforeEach(() => {
    cy.visit('#/card/card-test.component');
  });

  cards.forEach((c) => {
    describe(`${c.size.sizeKey} reveal card`, () => {
      it(`should show only front card`, () => {
        const revealCard = `nb-reveal-card:eq(${c.i})`;
        const frontCard = `${revealCard} nb-card-front:first`;
        const backCardContainer = `${revealCard} .second-card-container:first`;

        cy.get(revealCard).should('not.have.class', 'revealed');
        cy.get(frontCard).should('be.visible');

        cy.get(backCardContainer).then(($el) => {
          const backCardTop = $el.css('top');
          cy.get(revealCard).then(($card) => {
            const cardHeight = $card.css('height');
            expect(toInt(backCardTop)).to.equal(toInt(cardHeight));
          });
        });
      });
    });
  });
});
