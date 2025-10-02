/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-layout', () => {
  beforeEach(() => {
    cy.visit('#/layout/layout-test.component');
  });

  it('should render container', () => {
    cy.get('#layout-fluid > div').should('have.class', 'scrollable-container');
  });
});
