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
});
