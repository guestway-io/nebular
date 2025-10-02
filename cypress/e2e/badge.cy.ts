/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export default function badgeTests(badgesConfig: any) {
  const { selector, badges } = badgesConfig;

  it('should display badge with correct text', () => {
    for (let i = 0; i < badges.length; i++) {
      cy.get(selector(i)).should('be.visible');
      cy.get(selector(i)).should('contain.text', badges[i].text);
    }
  });
}
