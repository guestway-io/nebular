/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-select', () => {
  beforeEach(() => {
    cy.visit('#/select/select-test.component');
  });

  it('should not shrink when has no placeholder and text', () => {
    const selectHeights = [24, 32, 40, 48, 56];

    cy.get('nb-select').each(($select, index) => {
      cy.wrap($select).should('contain.text', '');
      cy.wrap($select).should('have.css', 'height', `${selectHeights[index]}px`);
    });
  });
});
