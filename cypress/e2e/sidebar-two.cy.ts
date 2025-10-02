/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-sidebar-two', () => {
  beforeEach(() => {
    cy.visit('#/sidebar/sidebar-two-test.component');
  });

  it('should render left non-fixed sidebar height minus header', () => {
    cy.get('nb-layout').then(($layout) => {
      const layoutSize = $layout[0].getBoundingClientRect();

      cy.get('nb-layout-header').then(($header) => {
        const headerSize = $header[0].getBoundingClientRect();

        cy.get('nb-sidebar')
          .first()
          .then(($sidebar) => {
            const sidebarSize = $sidebar[0].getBoundingClientRect();
            expect(sidebarSize.height).to.equal(layoutSize.height - headerSize.height);
          });
      });
    });
  });
});
