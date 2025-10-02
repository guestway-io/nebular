/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-popover', () => {
  beforeEach(() => {
    cy.visit('#/popover/popover-test.component');
  });

  it('render template ref', () => {
    cy.get('nb-card:nth-child(1) button:nth-child(1)').click();
    cy.get('nb-layout nb-popover nb-card').should('be.visible');
  });
});
