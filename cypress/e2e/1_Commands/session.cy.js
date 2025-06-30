/// <reference types="cypress" />

describe('Session', () => {

  before(() => {
    cy.loginManually();
    cy.saveSession();
  });

  it('should be able to restore session #1', () => {
    cy.restoreSession();
    cy.visit('/claimants');
    cy.url().should('contain', '/claimants');
  });

  it('should be able to restore session #2', () => {
    cy.restoreSession();
    cy.visit('/projects');
    cy.url().should('contain', '/projects');
  });

})
