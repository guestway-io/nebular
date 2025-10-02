/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-sidebar-one', () => {
  beforeEach(() => {
    cy.visit('#/sidebar/sidebar-one-test.component');
  });

  it('should render sidebar full pages', () => {
    cy.get('nb-layout').then(($layout) => {
      const layoutSize = $layout[0].getBoundingClientRect();

      cy.get('nb-sidebar')
        .first()
        .then(($sidebar) => {
          const sidebarSize = $sidebar[0].getBoundingClientRect();
          expect(sidebarSize.height).to.equal(layoutSize.height);
          expect(sidebarSize.width).to.equal(256);
        });
    });
  });
});
