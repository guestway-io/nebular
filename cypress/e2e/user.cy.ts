/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import badgeTests from './badge.cy';

describe('nb-user', () => {
  beforeEach(() => {
    cy.visit('#/user/user-test.component');
  });

  describe('badge', () => {
    const elementsOffset = 10;
    const badgeText = '29';
    const badgesConf = {
      selector: (i: number) => `.test-row:nth-child(${elementsOffset + i + 1}) nb-badge`,
      badges: [{ position: 'top right', status: 'primary', text: badgeText }],
    };
    badgeTests(badgesConf);
  });

  it('background image should have base64 image', () => {
    cy.get('#base64-image .user-picture.image').should(
      'have.css',
      'background-image',
      'url("data:image/png;base64,aaa")',
    );
  });
});
