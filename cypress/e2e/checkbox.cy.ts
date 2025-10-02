/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-checkbox', () => {
  beforeEach(() => {
    cy.visit('#/checkbox/checkbox-test.component');
  });

  it('should apply check on click', () => {
    const input = '#first input';
    const indicator = '#first .custom-checkbox';

    cy.get(input).should('not.be.checked');
    cy.get(indicator).click();
    cy.get(input).should('be.checked');
    cy.get(indicator).click();
    cy.get(input).should('not.be.checked');
  });
});
