/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-route-tabset', () => {
  beforeEach(() => {
    cy.visit('#/tabset/route-tabset-showcase.component');
  });

  it('should display default route-tabset', () => {
    cy.get('nb-card:nth-child(1) nb-route-tabset > ul > li:nth-child(1)').should('contain.text', 'Users');

    cy.get('nb-card:nth-child(1) nb-route-tabset > ul > li:nth-child(2)').should('contain.text', 'Orders');
  });
});
