/// <reference types="cypress" />

describe('Quick Search', () => {

  before(() => {
    cy.loginManually();
    cy.saveSession();
  });

  beforeEach(() => {
    cy.restoreSession();
    cy.visit('/claimants');
    cy.waitUntilLoaded();
  });

  it('should send a correct search-request', () => {
    cy.intercept('/api/global-search/clients').as('searchClients');

    cy.get(q`%quick-search`).within(() => {
      cy.fixture('quick-search/sample-request.json').then(expectedBody => {
        cy.get('input').type(expectedBody.query);
        cy.wait('@searchClients').its('request.body').should('deep.equal', expectedBody);
      });
    })
  });

  it('should populate a dropdown with found results', () => {
    cy.intercept('/api/global-search/clients').as('searchClients');

    cy.get(q`%quick-search`).within(() => {
      cy.get(q`%quick-search-results`).should('not.exist');
      cy.get('input').type('John');
      cy.waitUntilLoaded();

      cy.wait('@searchClients').its('response.body').then((body) => {
        cy.get(q`%quick-search-results`).should('be.visible');
        cy.get(q`%quick-search-result-link`)
          .should('have.length', body.length)
          .each(($resultLink, index) => {
            const client = body[index];
            cy.wrap($resultLink).should('contain.text', `${client.name} (${client.id})`);
          });

      });
    });
  });

  it('should navigate through search results', () => {
    cy.intercept('/api/global-search/clients').as('searchClients');
    cy.get(q`%quick-search`).within(() => {

      cy.get('input').type('test');
      cy.waitUntilLoaded();

      cy.wait('@searchClients').its('response.body').then(() => {
        cy.get(q`%quick-search-result-link:nth-child(1)`).click();
        cy.waitUntilLoaded();
        cy.url().should('match', /claimants\/[0-9]+/);
      });

      cy.get('input').type('test');
      cy.waitUntilLoaded();

      cy.wait('@searchClients').its('response.body').then(() => {
        cy.get(q`%quick-search-result-link:nth-child(2)`).click();
        cy.url().should('match', /claimants\/[0-9]+/);
      });
    });
  });

  it('should redirect by {enter} to claimants page with pre-filled grid-filters', () => {

    cy.get(q`%quick-search input`).type('John Doe{enter}');
    cy.url().should('contain', '/claimants');
    cy.waitUntilLoaded();

    cy.get(q`%%grid=claimants`).within(($grid) => {
      const firstNameColIndex = $grid.find(q`%%grid-titles-column:contains("First Name")`).index();
      const lastNameColIndex = $grid.find(q`%%grid-titles-column:contains("Last Name")`).index();

      cy.getGridFilter(firstNameColIndex).should('equal', 'John');
      cy.getGridFilter(lastNameColIndex).should('equal', 'Doe');
    });
  });

});
