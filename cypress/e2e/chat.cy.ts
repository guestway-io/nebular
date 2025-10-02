/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { colors, chatSizes as sizes } from '../support/component-shared';

let chats: any[] = [];

function prepareChats() {
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

describe('nb-chat', () => {
  before(() => {
    chats = prepareChats();
    cy.visit('#/chat/chat-test.component');
  });

  chats.forEach((c) => {
    it(`should display ${c.colorKey} chat with ${c.size} size`, () => {
      cy.get(`nb-chat:nth-child(${c.elementNumber})`).should('be.visible');

      cy.get(`nb-chat:nth-child(${c.elementNumber})`).should('have.css', 'height', c.height);

      cy.get(`nb-chat:nth-child(${c.elementNumber}) .header`).should('have.css', 'background-color', c.color);
    });
  });
});
