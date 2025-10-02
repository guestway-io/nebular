/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-tabset', () => {
  beforeEach(() => {
    cy.visit('#/tabset/tabset-test.component');
  });

  it('should display default tabset', () => {
    cy.get('nb-tabset:nth-child(1) > ul > li:nth-child(1)').should('contain.text', 'Tab #1');
    cy.get('nb-tabset:nth-child(1) > nb-tab[tabTitle="Tab #1"] > span').should('contain.text', 'Content #1');

    cy.get('nb-tabset:nth-child(1) > ul > li:nth-child(2)').should('contain.text', 'Tab #2');
    cy.get('nb-tabset:nth-child(1) > ul > li:nth-child(3)').should('contain.text', 'Tab #3');
  });
});
