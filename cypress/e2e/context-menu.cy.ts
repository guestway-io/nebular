/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-context-menu', () => {
  beforeEach(() => {
    cy.visit('#/context-menu/context-menu-test.component');
  });

  it('have to hide when click on item', () => {
    cy.get('nb-card:nth-child(1) nb-user:nth-child(1)').click();
    cy.get('nb-layout nb-context-menu').should('be.visible');
    cy.get('nb-layout nb-context-menu nb-menu > ul > li').eq(2).should('be.visible');

    cy.get('nb-layout nb-context-menu nb-menu > ul > li').eq(2).click();
    cy.get('nb-layout nb-context-menu').should('not.exist');
  });
});
