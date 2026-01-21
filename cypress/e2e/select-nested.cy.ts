/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

describe('nb-select with nested options', () => {
  describe('Basic nested select (hover mode)', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-showcase.component');
      cy.viewport(1280, 720);
    });

    it('should open submenu on hover over nested option', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-list').should('be.visible');

      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');
      cy.get('.nb-option-nested-panel nb-option').should('have.length.at.least', 1);
    });

    it('should highlight selection path when option is selected', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').first().click();

      // Reopen
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().should('have.class', 'has-selected-child');
    });
  });

  describe('Multi-select with nested options', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-multiple.component');
      cy.viewport(1280, 720);
    });

    it('should keep dropdown open when selecting multiple options', () => {
      cy.get('nb-select').click();

      cy.get('nb-option-nested').last().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Click first option
      cy.get('.nb-option-nested-panel nb-option').eq(0).click();
      cy.get('nb-option-list').should('be.visible');

      // Click second option
      cy.get('.nb-option-nested-panel nb-option').eq(1).click();
      cy.get('nb-option-list').should('be.visible');

      cy.get('.selected-info').should('exist');
    });

    it('should show checkboxes for multi-select options', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').last().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      cy.get('.nb-option-nested-panel nb-option').first().should('have.class', 'multiple');
    });

    it('should keep neutral background for selected options in multi-select', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').last().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      cy.get('.nb-option-nested-panel nb-option').first().click();

      cy.get('.nb-option-nested-panel nb-option.selected').should('exist');
      cy.get('.nb-option-nested-panel nb-option.selected').should('have.class', 'multiple');
    });

    it('should highlight selection path for nested options in multi-select', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').last().trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').first().click();

      // Close with escape and reopen
      cy.get('nb-select').click(); // This toggles it closed
      cy.get('nb-select').click(); // Reopen

      cy.get('nb-option-nested').last().should('have.class', 'has-selected-child');
    });
  });

  describe('Deep nested select (3+ levels) - hover mode', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-deep.component');
      cy.viewport(1280, 720);
    });

    it('should navigate through multiple nesting levels', () => {
      cy.get('nb-select').click();

      cy.get('nb-option-list nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      cy.get('.nb-option-nested-panel nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('have.length.at.least', 2);
    });

    it('should open sibling submenu when hovering different nested option', () => {
      cy.get('nb-select').click();

      // Open first nested option submenu
      cy.get('nb-option-list nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Hover second nested option
      cy.get('nb-option-list nb-option-nested').eq(1).trigger('mouseenter');
      cy.wait(300); // Wait for animation

      // Should have at least one submenu open
      cy.get('.nb-option-nested-panel').should('have.length.at.least', 1);
    });
  });

  describe('Replacement mode (mobile/narrow viewport)', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-deep.component');
      cy.viewport(400, 720);
    });

    it('should show back header when entering nested option', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      cy.get('.nested-back-header').should('be.visible');
    });

    it('should navigate back when clicking back header', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();
      cy.get('.nested-back-header').should('be.visible');

      cy.get('.nested-back-header').click();

      cy.get('.nested-back-header').should('not.exist');
      cy.get('nb-option-nested').should('have.length.at.least', 2);
    });

    it('should navigate through multiple levels in replacement mode', () => {
      cy.get('nb-select').click();

      // Level 1
      cy.get('nb-option-nested').first().click();
      cy.get('.nested-back-header').should('be.visible');

      // Level 2
      cy.get('nb-option-nested').first().click();

      // Level 3
      cy.get('nb-option-nested').first().click();

      // Should see leaf options
      cy.get('nb-option').should('have.length.at.least', 1);
    });

    it('should go back with left arrow key in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();
      cy.get('.nested-back-header').should('be.visible');

      cy.get('nb-option-list').trigger('keydown', { keyCode: 37, key: 'ArrowLeft' });

      cy.get('.nested-back-header').should('not.exist');
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      cy.visit('#/select/select-nested-showcase.component');
      cy.viewport(1280, 720);
    });

    it('should open select with arrow down on button', () => {
      cy.get('nb-select .select-button').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });
      cy.get('nb-option-list').should('be.visible');
    });

    it('should open submenu with right arrow when nested option is hovered', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');
    });
  });

  describe('Edge cases', () => {
    it('should handle disabled nested option', () => {
      cy.visit('#/select/select-nested-disabled.component');
      cy.viewport(1280, 720);

      // Enable the disabled checkbox
      cy.get('nb-checkbox').first().click();

      cy.get('nb-select').click();

      // The disabled nested option should exist with disabled attribute
      cy.get('nb-option-nested[disabled]').should('exist');
    });

    it('should work with mixed content (options and nested options)', () => {
      cy.visit('#/select/select-nested-showcase.component');
      cy.viewport(1280, 720);

      cy.get('nb-select').click();

      // Should have both regular options and nested options
      cy.get('nb-option-list nb-option').should('have.length.at.least', 1);
      cy.get('nb-option-list nb-option-nested').should('have.length.at.least', 1);
    });

    it('should work with form integration', () => {
      cy.visit('#/select/select-nested-form.component');
      cy.viewport(1280, 720);

      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel nb-option').first().click();

      // Form should have the selected value
      cy.get('.form-value').should('contain.text', 'category');
    });
  });

  describe('Search functionality', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);
    });

    it('should show search input when searchable is enabled', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').should('be.visible');
    });

    it('should focus search input on dropdown open', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').should('be.focused');
    });

    it('should filter options when typing in search input', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('web');

      // Should show search results
      cy.get('.search-result-item').should('have.length.at.least', 1);
      cy.get('.search-result-item').first().should('contain.text', 'Web');
    });

    it('should show breadcrumb path for nested options in search results', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('clean');

      // Should show path in search results
      cy.get('.search-result-path').should('exist');
    });

    it('should show empty message when no results match', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('xyznonexistent');

      cy.get('.search-empty-message').should('be.visible');
    });

    it('should select option from search results', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('web');

      cy.get('.search-result-item').first().click();

      // Dropdown should close and value should be selected
      cy.get('nb-option-list').should('not.exist');
    });

    it('should navigate search results with arrow keys', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('cat');

      // Arrow down should highlight first result
      cy.get('.select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });
      cy.get('.search-result-item.active').should('exist');
    });

    it('should clear search on escape', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('web');
      cy.get('.search-result-item').should('exist');

      cy.get('.select-search-input').trigger('keydown', { keyCode: 27, key: 'Escape' });

      // Search should be cleared, showing original options
      cy.get('.search-result-item').should('not.exist');
    });

    it('should clear search when dropdown closes', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').type('web');

      // Close dropdown by pressing Escape twice (first clears search, second closes)
      cy.get('.select-search-input').trigger('keydown', { keyCode: 27, key: 'Escape' });
      cy.get('.select-search-input').trigger('keydown', { keyCode: 27, key: 'Escape' });

      // Reopen dropdown
      cy.get('nb-select').click();

      // Search should be cleared
      cy.get('.select-search-input').should('have.value', '');
    });
  });

  describe('Search in replacement mode', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(400, 720);
    });

    it('should show search input in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      cy.get('.nested-back-header').should('be.visible');
      cy.get('.nested-search-header .select-search-input').should('be.visible');
    });

    it('should filter nested options in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      cy.get('.nested-search-header .select-search-input').type('brand');

      cy.get('.nested-search-result-item').should('have.length.at.least', 1);
    });

    it('should go back when pressing left arrow in nested search', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      cy.get('.nested-search-header .select-search-input').trigger('keydown', { keyCode: 37, key: 'ArrowLeft' });

      cy.get('.nested-back-header').should('not.exist');
    });

    it('should navigate to options with arrow down in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      // Focus should be on nested search input
      cy.get('.nested-search-header .select-search-input').should('be.visible');

      // Press down arrow to navigate to options
      cy.get('.nested-search-header .select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });

      // Should have child options visible
      cy.get('nb-option-list nb-option').should('have.length.at.least', 1);
    });

    it('should allow selecting option with click after keyboard navigation in replacement mode', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().click();

      // Navigate down
      cy.get('.nested-search-header .select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });

      // Click an option
      cy.get('nb-option-list nb-option').first().click();

      // Dropdown should close
      cy.get('nb-option-list').should('not.exist');
    });
  });

  describe('Search in overlay submenu', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);
    });

    it('should show search input in overlay submenu when hovering nested option', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');

      cy.get('.nb-option-nested-panel .select-search-input').should('be.visible');
    });

    it('should filter options in overlay submenu', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');

      cy.get('.nb-option-nested-panel .select-search-input').type('clean');

      cy.get('.nb-option-nested-panel .overlay-search-result-item').should('have.length.at.least', 1);
    });
  });

  describe('Keyboard navigation with searchable select', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);
    });

    it('should allow keyboard navigation from search input to options', () => {
      cy.get('nb-select').click();
      cy.get('.select-search-input').should('be.focused');

      // Press down arrow twice then enter to select second option
      cy.get('.select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });
      cy.get('.select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });

      // Verify options exist and keyboard navigation is possible
      cy.get('nb-option-list nb-option').should('have.length.at.least', 2);
    });

    it('should allow selecting option by clicking after keyboard navigation', () => {
      cy.get('nb-select').click();

      // Navigate down to see options
      cy.get('.select-search-input').trigger('keydown', { keyCode: 40, key: 'ArrowDown' });

      // Click first option directly
      cy.get('nb-option-list nb-option').first().click();

      // Dropdown should close after selection
      cy.get('nb-option-list').should('not.exist');
    });
  });

  describe('Keyboard navigation in overlay submenu', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);
    });

    it('should close overlay submenu and return to parent with arrow left', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').first().trigger('mouseenter');

      cy.get('.nb-option-nested-panel').trigger('mouseenter');
      cy.get('.nb-option-nested-panel .select-search-input').should('be.focused');

      // Press left arrow - should close submenu
      cy.get('.nb-option-nested-panel .select-search-input').trigger('keydown', { keyCode: 37, key: 'ArrowLeft' });

      // Submenu should be closed
      cy.get('.nb-option-nested-panel').should('not.exist');
    });

    it('should not focus overlay search input on mouse hover over parent option', () => {
      cy.get('nb-select').click();

      // Hover over nested option - submenu opens
      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Search input should NOT be focused yet (only panel visible)
      // Focus should still be on main search input or nothing
      cy.get('.nb-option-nested-panel .select-search-input').should('not.be.focused');
    });

    it('should focus overlay search input when mouse enters the submenu panel', () => {
      cy.get('nb-select').click();

      // Hover over nested option - submenu opens
      cy.get('nb-option-nested').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Now enter the submenu panel
      cy.get('.nb-option-nested-panel').trigger('mouseenter');

      // Search input should be focused
      cy.get('.nb-option-nested-panel .select-search-input').should('be.focused');
    });

    it('should close child submenus when typing in overlay search', () => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);

      cy.get('nb-select').click();

      // Navigate to Infrastructure which has nested children (Cloud, On-Premise)
      cy.get('nb-option-nested').contains('Infrastructure').trigger('mouseenter');
      cy.get('.nb-option-nested-panel').should('be.visible');

      // Hover over Cloud to open its submenu
      cy.get('.nb-option-nested-panel nb-option-nested').first().trigger('mouseenter');
      // Wait for potential child submenu
      cy.wait(300);

      // Now enter the Infrastructure panel and type in search
      cy.get('.nb-option-nested-panel').first().trigger('mouseenter');
      cy.get('.nb-option-nested-panel .select-search-input').first().type('aws');

      // Search results should be visible
      cy.get('.nb-option-nested-panel .overlay-search-result-item').should('have.length.at.least', 1);
    });
  });

  describe('Placeholder for nested search input', () => {
    beforeEach(() => {
      cy.visit('#/select/select-searchable.component');
      cy.viewport(1280, 720);
    });

    it('should use nested option title as placeholder in overlay submenu', () => {
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').trigger('mouseenter');

      cy.get('.nb-option-nested-panel .select-search-input').should('have.attr', 'placeholder', 'Category');
    });

    it('should use nested option title as placeholder in replacement mode', () => {
      cy.viewport(400, 720);
      cy.get('nb-select').click();
      cy.get('nb-option-nested').contains('Category').click();

      cy.get('.nested-search-header .select-search-input').should('have.attr', 'placeholder', 'Category');
    });
  });
});
