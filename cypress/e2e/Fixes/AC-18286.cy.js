/// <reference types="cypress" />

describe('AC-18286 Production: Gross display of miss information - Wrong claimant name is shown in Communication', () => {

  before(() => {
    cy.loginManually();
    cy.saveSession();
  });

  beforeEach(() => {
    cy.restoreSession();
  });

  it('Should display correct claimant name in header', () => {
    const MAX_TRIES = 5;

    cy.repeat(MAX_TRIES, (attempt) => {
      cy.visit('/claimants');
      cy.waitUntilLoaded();

      cy.get(q`%%grid="claimants"%(status=loaded) %%grid-rows %%grid-row:nth-child(${attempt})`).dblclick({ force: true });
      cy.waitUntilLoaded();

      cy.get(q`%tab-group-tab:contains("Details")`).click();
      cy.waitUntilLoaded();
      cy.get(q`%action-bar-action:contains("Back")`).click();
      cy.waitUntilLoaded();

      cy.intercept({ url: r`**/api/clients/:clientId<\\d+>`, times: 1 }).as('fetchClaimant');
      cy.get(q`%%grid="claimants"%(status=loaded) %%grid-rows %%grid-row:nth-child(${attempt + 1})`).dblclick({ force: true });
      cy.wait('@fetchClaimant').its('response.body').then((claimant) => {
        cy.waitUntilLoaded();

        cy.get(q`%tab-group-tab:contains("Communications")`).click();
        cy.waitUntilLoaded();

        cy.get(q`%action-bar-action:contains("Log Communication")`).click();
        cy.get(q`%context-bar-title`).should('contain.text', claimant.fullName)
      });

    });
  });

});
