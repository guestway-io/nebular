/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-layout theme', () => {
  beforeEach(() => {
    cy.visit('#/layout/theme-change-test.component');
  });

  it('should render default theme', () => {
    cy.get('body').should('have.class', 'nb-theme-default');
  });

  it('should switch theme', () => {
    const button = '#change-theme';
    const body = 'body';
    const cardHeader = 'nb-card-header';

    const themeDefault = 'nb-theme-default';
    const themeBlue = 'nb-theme-cosmic';

    cy.get(button).click();
    cy.get(body).should('have.class', themeBlue);
    cy.get(cardHeader).should('have.css', 'color', 'rgb(255, 255, 255)');

    cy.get(button).click();
    cy.get(body).should('have.class', themeDefault);
    cy.get(cardHeader).should('have.css', 'color', 'rgb(34, 43, 69)');
  });
});
