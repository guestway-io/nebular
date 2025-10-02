/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-search', () => {
  beforeEach(() => {
    cy.visit('#/search/search-test.component');
  });

  it('should be able to show search-field', () => {
    cy.get('.start-search').click();
    // Wait for animation to complete
    cy.get('.search-input', { timeout: 1500 }).should('be.visible');
    cy.get('nb-search-field').should('have.class', 'show');
  });
});
