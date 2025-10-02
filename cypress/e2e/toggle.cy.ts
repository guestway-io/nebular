/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-toggle', () => {
  beforeEach(() => {
    cy.visit('#/toggle/toggle-test.component');
  });

  it('should turn on on click', () => {
    const input = '#first input';
    const indicator = '#first .toggle';

    cy.get(input).should('not.be.checked');
    cy.get(indicator).click();
    cy.get(input).should('be.checked');
    cy.get(indicator).click();
    cy.get(input).should('not.be.checked');
  });
});
