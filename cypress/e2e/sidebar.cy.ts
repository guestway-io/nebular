/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-sidebar', () => {
  beforeEach(() => {
    cy.visit('#/sidebar/sidebar-test.component');
  });

  it('should render sidebar hidden', () => {
    cy.get('nb-sidebar[state="collapsed"]')
      .first()
      .then(($sidebar) => {
        const sidebarSize = $sidebar[0].getBoundingClientRect();
        expect(sidebarSize.width).to.equal(0);
      });
  });
});
