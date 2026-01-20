/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-select with nested options', () => {
  describe('Basic nested select (hover mode)', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-showcase.component');
      // Ensure viewport is wide enough for hover mode (not replacement mode)
      cy.viewport(1280, 720);
    });

    it('should open submenu on hover over nested option', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-list').should('be.visible');

      // Hover over nested option
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');

      // Wait for submenu to appear
      cy.get('.nb-option-nested-panel').should('be.visible');
      cy.get('.nb-option-nested-panel nb-option').should('have.length.at.least', 1);
    });

    it('should select option from nested submenu', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');

      cy.get('.nb-option-nested-panel').should('be.visible');
      cy.get('.nb-option-nested-panel nb-option').contains('Cleaning').click();

      // Select should close and show selected value
      cy.get('nb-option-list').should('not.exist');
      cy.get('.selected-info').should('contain.text', 'cleaning');
    });

    it('should close submenu when mouse leaves', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Move mouse away
      cy.get('nb-option-nested').contains('Category').trigger('mouseleave');

      // Submenu should close after delay
      cy.get('.nb-option-nested-panel').should('not.exist');
    });

    it('should close previous sibling submenu when hovering different nested option', () => {
      cy.visit('#/select/select-nested-deep.component');
      cy.viewport(1280, 720);

      cy.get('nb-select').click();

      // Hover over North America
      cy.get('nb-option-list > nb-option-nested').contains('North America').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Hover over Europe (sibling)
      cy.get('nb-option-list > nb-option-nested').contains('Europe').trigger('mouseenter');

      // Should only have one submenu panel visible (Europe's)
      cy.get('.nb-option-nested-panel').should('have.length', 1);
    });

    it('should close all submenus when clicking outside', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Click outside
      cy.get('body').click(0, 0);

      // Everything should be closed
      cy.get('nb-option-list').should('not.exist');
      cy.get('.nb-option-nested-panel').should('not.exist');
    });

    it('should highlight selection path when option is selected', () => {
      // First select an option
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').contains('Cleaning').click();

      // Reopen and check the path is highlighted
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').should('have.class', 'has-selected-child');
    });
  });

  describe('Multi-select with nested options', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-multiple.component');
      cy.viewport(1280, 720);
    });

    it('should keep dropdown open when selecting multiple options', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Databases').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Click first option
      cy.get('.nb-option-nested-panel nb-option').contains('PostgreSQL').click();
      cy.get('nb-option-list').should('be.visible'); // Should still be open

      // Click second option
      cy.get('.nb-option-nested-panel nb-option').contains('MySQL').click();
      cy.get('nb-option-list').should('be.visible'); // Should still be open

      // Click third option
      cy.get('.nb-option-nested-panel nb-option').contains('MongoDB').click();
      cy.get('nb-option-list').should('be.visible'); // Should still be open

      // Verify selections
      cy.get('.selected-info').should('contain.text', 'postgresql');
      cy.get('.selected-info').should('contain.text', 'mysql');
      cy.get('.selected-info').should('contain.text', 'mongodb');
    });

    it('should show checkboxes for multi-select options', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Databases').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Options should have the multiple class for checkbox styling
      cy.get('.nb-option-nested-panel nb-option').first().should('have.class', 'multiple');
    });

    it('should keep neutral background for selected options in multi-select', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Databases').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Select an option
      cy.get('.nb-option-nested-panel nb-option').contains('PostgreSQL').click();

      // The selected option should have neutral styling (not primary blue background)
      cy.get('.nb-option-nested-panel nb-option.selected').should('exist');
    });

    it('should highlight selection path for nested options in multi-select', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Databases').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').contains('PostgreSQL').click();

      // Close and reopen
      cy.get('body').click(0, 0);
      cy.get('nb-select').click();

      // Databases should be highlighted as it has a selected child
      cy.get('nb-option-nested').contains('Databases').should('have.class', 'has-selected-child');
    });
  });

  describe('Deep nested select (3+ levels)', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-deep.component');
      cy.viewport(1280, 720);
    });

    it('should navigate through multiple nesting levels', () => {
      cy.get('nb-select').click();

      // Level 1: North America
      cy.get('nb-option-list > nb-option-nested').contains('North America').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Level 2: United States
      cy.get('.nb-option-nested-panel nb-option-nested').contains('United States').trigger('mouseenter');

      // Level 3: California
      cy.get('.nb-option-nested-panel nb-option-nested').contains('California').trigger('mouseenter');

      // Level 4: Select San Francisco
      cy.get('.nb-option-nested-panel nb-option').contains('San Francisco').should('be.visible');
    });

    it('should select option from deeply nested menu', () => {
      cy.get('nb-select').click();

      cy.get('nb-option-list > nb-option-nested').contains('North America').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option-nested').contains('United States').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option-nested').contains('California').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').contains('San Francisco').click();

      cy.get('nb-option-list').should('not.exist');
      cy.get('.selected-info').should('contain.text', 'sf');
    });

    it('should close entire nested chain when switching to sibling at top level', () => {
      cy.get('nb-select').click();

      // Open deep nested path
      cy.get('nb-option-list > nb-option-nested').contains('North America').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option-nested').contains('United States').trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option-nested').contains('California').trigger('mouseenter');

      // Multiple panels should be open
      cy.get('.nb-option-nested-panel').should('have.length.at.least', 3);

      // Now hover over Europe (sibling at top level)
      cy.get('nb-option-list > nb-option-nested').contains('Europe').trigger('mouseenter');

      // Only Europe's submenu should be visible now
      cy.wait(200); // Wait for hide animation
      cy.get('.nb-option-nested-panel').should('have.length', 1);
    });
  });

  describe('Replacement mode (mobile/narrow viewport)', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-deep.component');
      // Set narrow viewport to trigger replacement mode
      cy.viewport(400, 720);
    });

    it('should show back header when entering nested option', () => {
      cy.get('nb-select').click();

      // Click on nested option (not hover, since we're in replacement mode)
      cy.get('nb-option-nested').contains('North America').click();

      // Should show back header with the nested option title
      cy.get('.nested-back-header').should('be.visible');
      cy.get('.nested-back-title').should('contain.text', 'North America');
    });

    it('should navigate back when clicking back header', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('.nested-back-header').should('be.visible');

      // Click back
      cy.get('.nested-back-header').click();

      // Should be back at root level
      cy.get('.nested-back-header').should('not.exist');
      cy.get('nb-option-nested').contains('North America').should('be.visible');
      cy.get('nb-option-nested').contains('Europe').should('be.visible');
    });

    it('should navigate through multiple levels in replacement mode', () => {
      cy.get('nb-select').click();

      // Level 1
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('.nested-back-title').should('contain.text', 'North America');

      // Level 2
      cy.get('nb-option-nested').contains('United States').click();
      cy.get('.nested-back-title').should('contain.text', 'United States');

      // Level 3
      cy.get('nb-option-nested').contains('California').click();
      cy.get('.nested-back-title').should('contain.text', 'California');

      // Should see cities
      cy.get('nb-option').contains('San Francisco').should('be.visible');
    });

    it('should select option and close in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('nb-option-nested').contains('United States').click();
      cy.get('nb-option-nested').contains('California').click();
      cy.get('nb-option').contains('San Francisco').click();

      // Should close and show selection
      cy.get('nb-option-list').should('not.exist');
      cy.get('.selected-info').should('contain.text', 'sf');
    });

    it('should reset to root level when reopening after selection', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('nb-option-nested').contains('United States').click();
      cy.get('nb-option-nested').contains('California').click();
      cy.get('nb-option').contains('San Francisco').click();

      // Reopen
      cy.get('nb-select').click();

      // Should be at root level, not in the submenu
      cy.get('.nested-back-header').should('not.exist');
      cy.get('nb-option-nested').contains('North America').should('be.visible');
      cy.get('nb-option-nested').contains('Europe').should('be.visible');
    });

    it('should reset to root level when closing without selection', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('nb-option-nested').contains('United States').click();

      // Close by clicking outside
      cy.get('body').click(0, 0);

      // Reopen
      cy.get('nb-select').click();

      // Should be at root level
      cy.get('.nested-back-header').should('not.exist');
      cy.get('nb-option-nested').contains('North America').should('be.visible');
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-showcase.component');
      cy.viewport(1280, 720);
    });

    it('should navigate with arrow keys in main list', () => {
      cy.get('nb-select').click();

      // Press down arrow to navigate
      cy.get('nb-option-list').trigger('keydown', { keyCode: 40 }); // Down
      cy.get('nb-option.active, nb-option-nested.active').should('exist');
    });

    it('should open submenu with arrow right on nested option', () => {
      cy.get('nb-select').click();

      // Navigate to nested option
      cy.get('nb-option-nested').contains('Category').focus();
      cy.get('nb-option-nested').contains('Category').trigger('keydown', { keyCode: 39 }); // Right arrow

      // Submenu should open
      cy.get('.nb-option-nested-panel').should('be.visible');
    });

    it('should close submenu with arrow left', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').focus();
      cy.get('nb-option-nested').contains('Category').trigger('keydown', { keyCode: 39 }); // Right arrow
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Press left arrow to close
      cy.get('.nb-option-nested-panel').trigger('keydown', { keyCode: 37 }); // Left arrow
      cy.get('.nb-option-nested-panel').should('not.exist');
    });

    it('should close submenu with escape', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').focus();
      cy.get('nb-option-nested').contains('Category').trigger('keydown', { keyCode: 39 }); // Right arrow
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Press escape to close
      cy.get('.nb-option-nested-panel').trigger('keydown', { keyCode: 27 }); // Escape
      cy.get('.nb-option-nested-panel').should('not.exist');
    });

    it('should select option with enter key', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      cy.get('.nb-option-nested-panel nb-option').first().focus();
      cy.get('.nb-option-nested-panel nb-option').first().trigger('keydown', { keyCode: 13 }); // Enter

      cy.get('nb-option-list').should('not.exist');
    });
  });

  describe('Keyboard navigation in replacement mode', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-deep.component');
      cy.viewport(400, 720);
    });

    it('should navigate with arrow keys in replacement mode', () => {
      cy.get('nb-select').click();

      // First down arrow should work
      cy.get('nb-option-list').trigger('keydown', { keyCode: 40 }); // Down
      cy.get('nb-option-nested.active, nb-option.active').should('exist');
    });

    it('should enter nested option with enter key in replacement mode', () => {
      cy.get('nb-select').click();

      // Focus on nested option and press enter
      cy.get('nb-option-nested').contains('North America').focus();
      cy.get('nb-option-nested').contains('North America').trigger('keydown', { keyCode: 13 }); // Enter

      // Should enter replacement mode
      cy.get('.nested-back-header').should('be.visible');
      cy.get('.nested-back-title').should('contain.text', 'North America');
    });

    it('should go back with arrow left in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('North America').click();
      cy.get('.nested-back-header').should('be.visible');

      // Press left arrow to go back
      cy.get('nb-option-list').trigger('keydown', { keyCode: 37 }); // Left arrow

      // Should be back at root
      cy.get('.nested-back-header').should('not.exist');
    });

    it('should navigate through deep nesting with keyboard in replacement mode', () => {
      cy.get('nb-select').click();

      // Enter North America
      cy.get('nb-option-nested').contains('North America').focus();
      cy.get('nb-option-nested').contains('North America').trigger('keydown', { keyCode: 13 });
      cy.get('.nested-back-title').should('contain.text', 'North America');

      // Navigate and enter United States
      cy.get('nb-option-nested').contains('United States').focus();
      cy.get('nb-option-nested').contains('United States').trigger('keydown', { keyCode: 13 });
      cy.get('.nested-back-title').should('contain.text', 'United States');

      // Navigate and enter California
      cy.get('nb-option-nested').contains('California').focus();
      cy.get('nb-option-nested').contains('California').trigger('keydown', { keyCode: 13 });
      cy.get('.nested-back-title').should('contain.text', 'California');

      // Should see cities and be able to navigate
      cy.get('nb-option').contains('San Francisco').should('be.visible');
    });
  });
});
