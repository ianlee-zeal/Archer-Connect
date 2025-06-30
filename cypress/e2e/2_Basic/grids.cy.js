/// <reference types="cypress" />

describe('Grids', () => {

  before(() => {
    cy.loginManually();
    cy.saveSession();
  });

  beforeEach(() => {
    cy.restoreSession();
  });

  it('should be able set different kind of filters', () => {
    cy.visit('/claimants');
    cy.get(q`%%grid=claimants`).within(($grid) => {

      const idColIndex = $grid.find(q`%%grid-titles-column:contains("Client ID")`).index();
      const birthDateColIndex = $grid.find(q`%%grid-titles-column:contains("Date of Birth")`).index();
      const statusColIndex = $grid.find(q`%%grid-titles-column:contains("Status")`).index();

      cy.setGridFilter(idColIndex, 123);
      cy.getGridFilter(idColIndex).should('equal', '123');
      cy.setGridFilter(birthDateColIndex, '01/01/2023');
      cy.getGridFilter(birthDateColIndex).should('equal', '01/01/2023');
      cy.setGridFilter(statusColIndex, 'Active');
      cy.getGridFilter(statusColIndex).should('equal', 'Active');
    });

  });

  it('should say "No Results." if nothing is found', () => {
    cy.visit('/claimants');
    cy.get(q`%%grid=claimants`).setGridFilter(0, 123);
    cy.get(q`%%grid=claimants %%grid-overlay`).should('contain.text', 'No Results.');
  });

})
