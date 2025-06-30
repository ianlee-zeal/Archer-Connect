/// <reference types="cypress" />

describe('AC-17958 [AT] UI Tests for Login Call Issue fix', () => {

  before(() => {
    cy.loginManually();
    cy.saveSession();
  });

  beforeEach(() => {
    cy.restoreSession();
    cy.visit('/claimants');
    cy.waitUntilLoaded();
  });

  it('Log Call widget should not be recreated when user goes by tabs', () => {
    const TEST_NOTES = 'blah blah blah';

    cy.url().should('contain', '/claimants');
    // Open first claimant
    cy.get(q`%%grid="claimants"%(status=loaded) %%grid-rows %%grid-row:first-child`).dblclick({ force: true });
    cy.waitUntilLoaded();
    cy.url().should('contain', '/overview/');

    // Open Log Call widget
    cy.get(q`%action-bar %action-bar-action`).contains('Log Call').click();
    cy.get(q`%log-call`).should('be.visible');
    cy.get(q`%log-call %log-call-notes`).type(TEST_NOTES);

    // After user goes to another tab Log Call widget should stay consistent
    cy.get(q`%tab-group %tab-group-tab:nth-child(2)`).click();
    cy.waitUntilLoaded();
    cy.get(q`%log-call`).should('be.visible');
    cy.get(q`%log-call %log-call-notes`).should('contain.text', TEST_NOTES);
  });

});
