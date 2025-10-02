/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-layout-footer', () => {
  beforeEach(() => {
    cy.visit('#/layout/layout-footer-test.component');
  });

  it('should render default footer', () => {
    cy.get('nb-layout-footer > nav').should('have.attr', 'class').and('not.be.empty');
  });
});
