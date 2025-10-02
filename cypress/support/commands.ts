/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to wait for element to be visible and interactable
       * @example cy.waitForElement('button')
       */
      waitForElement(selector: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to check if element has specific class
       * @example cy.hasClass('button', 'active')
       */
      hasClass(selector: string, className: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to convert hex color to rgba
       * @example cy.hexToRgba('#3366ff')
       */
      hexToRgba(hex: string, alpha?: number): Chainable<string>;
    }
  }
}

// Custom command to select by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

// Custom command to wait for element to be visible and interactable
Cypress.Commands.add('waitForElement', (selector: string) => {
  return cy.get(selector).should('be.visible').should('not.be.disabled');
});

// Custom command to check if element has specific class
Cypress.Commands.add('hasClass', (selector: string, className: string) => {
  return cy.get(selector).should('have.class', className);
});

// Custom command to convert hex to rgba
Cypress.Commands.add('hexToRgba', (hex: string, alpha: number = 1) => {
  const result = /^#([A-Fa-f0-9]{3}){1,2}$/.exec(hex);
  if (!result) {
    throw new Error('Bad Hex');
  }

  let c = result[1].split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const color = parseInt(c.join(''), 16);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;

  return cy.wrap(`rgba(${r}, ${g}, ${b}, ${alpha})`);
});

export {};
