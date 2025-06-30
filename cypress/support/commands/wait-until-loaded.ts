import { timeout } from '../helpers';

const PRELOADING_TIMEOUT = 3_000;
const CHECK_TIMEOUT = 1_000;
const LOADING_TIMEOUT = Cypress.env('isLocalEnv') ? 40_000 : 20_000;

Cypress.Commands.add(
  'waitUntilLoaded',
  () => {
    cy.document()
      .find('body')
      .within(async ($body) => {
        let timeLeft = PRELOADING_TIMEOUT;
        while (timeLeft -= CHECK_TIMEOUT) {
          if ($body.find(q`%loading-indicator`).length) {
            return;
          }
          await timeout(CHECK_TIMEOUT);
        }
      });

    cy.get(q`%loading-indicator`, { timeout: LOADING_TIMEOUT }).should('not.exist');
  });
