/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-layout-header', () => {
  beforeEach(() => {
    cy.visit('#/layout/layout-header-test.component');
  });

  it('should render default header', () => {
    cy.get('nb-layout-header > nav').should('have.attr', 'class').and('not.be.empty');
  });
});
