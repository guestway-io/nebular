/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('accordion', () => {
  beforeEach(() => {
    cy.visit('#/accordion/accordion-test.component');
  });

  it('should display the 4 accordion items', () => {
    cy.get('nb-accordion > nb-accordion-item').should('have.length', 4);

    cy.get('nb-accordion > nb-accordion-item:nth-child(1) > nb-accordion-item-header').should(
      'contain.text',
      'Accordion #1',
    );

    cy.get('nb-accordion > nb-accordion-item:nth-child(2) > nb-accordion-item-header').should(
      'contain.text',
      'Accordion #2',
    );

    cy.get('nb-accordion > nb-accordion-item:nth-child(2)').should('have.class', 'collapsed');

    cy.get('nb-accordion > nb-accordion-item:nth-child(3) > nb-accordion-item-header').should(
      'contain.text',
      'Accordion #3',
    );

    cy.get('nb-accordion > nb-accordion-item:nth-child(3)').should('have.class', 'expanded');
  });

  describe('a11y', () => {
    it('should be interactable through keyboard', () => {
      cy.get('nb-accordion > nb-accordion-item:nth-child(3)').should('have.class', 'expanded');

      cy.get('nb-accordion > nb-accordion-item:nth-child(3) > nb-accordion-item-header').focus().type('{enter}');

      cy.get('nb-accordion > nb-accordion-item:nth-child(3)').should('have.class', 'collapsed');
    });
  });
});
