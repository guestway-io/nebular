/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import badgeTests from './badge.cy';

describe('nb-action', () => {
  before(() => {
    cy.visit('#/action/action-test.component');
  });

  describe('badge', () => {
    const badgeText = '29';
    const badgesConf = {
      selector: (i: number) => `nb-card:nth-child(4) nb-actions nb-action:nth-child(${i + 1}) nb-badge`,
      badges: [{ position: 'bottom left', status: 'success', text: badgeText }],
    };
    badgeTests(badgesConf);
  });
});
