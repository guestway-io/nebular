/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { colors, alertSizes as sizes } from '../support/component-shared';

let alerts: any[] = [];

function prepareAlerts() {
  const result: any[] = [];

  let elementNumber: number = 1;
  for (const { colorKey, color } of colors) {
    for (const { sizeKey, height } of sizes) {
      result.push({
        size: sizeKey,
        height: height,
        colorKey,
        color,
        elementNumber,
      });
      elementNumber++;
    }
  }

  return result;
}

describe('nb-alert', () => {
  before(() => {
    alerts = prepareAlerts();
    cy.visit('#/alert/alert-test.component');
  });

  alerts.forEach((c) => {
    it(`should display ${c.colorKey} alert with ${c.size} size`, () => {
      cy.get(`nb-alert:nth-child(${c.elementNumber})`).should('be.visible');
      cy.get(`nb-alert:nth-child(${c.elementNumber})`).should('contain.text', 'Success message!');

      cy.get(`nb-alert:nth-child(${c.elementNumber})`).should('have.css', 'height', c.height);

      cy.get(`nb-alert:nth-child(${c.elementNumber})`).should('have.css', 'background-color', c.color);
    });
  });
});
