/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-menu', () => {
  beforeEach(() => {
    cy.visit('#/menu/menu-test.component');
  });

  it('should display group title', () => {
    cy.get('#menu-first ul li:nth-child(1) span').first().should('contain.text', 'Menu Items');
  });

  it('should display menu', () => {
    cy.get('#menu-first').should('be.visible');
    cy.url().should('include', '#/menu/menu-test.component/1');
  });

  it('should be selected - Menu #1', () => {
    cy.get('#menu-first ul li:nth-child(2) a').first().should('contain.text', 'Menu #1');

    cy.get('#menu-first ul li:nth-child(2) a').first().click().should('have.class', 'active');

    cy.url().should('include', '#/menu/menu-test.component/1');
  });
});
