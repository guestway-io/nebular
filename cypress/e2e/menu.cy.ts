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

  // TODO: Re-enable when we have a way to test the active state without relying on URL hash, which is currently not working in Cypress due to limitations with Angular's router and Cypress's handling of URL changes.
  // it('should be selected - Menu #1', () => {
  //   cy.get('#menu-first ul li:nth-child(2) a').first().should('contain.text', 'Menu #1');
  //
  //   cy.get('#menu-first ul li:nth-child(2) a').first().click();
  //   cy.get('#menu-first ul li:nth-child(2) a').first().should('have.class', 'active');
  //
  //   cy.url().should('include', '#/menu/menu-test.component/1');
  // });
});
