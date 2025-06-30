/// <reference types="cypress" />

describe('Login', () => {

  it('should redirect from the base url to login server', () => {
    cy.visit('/');
    cy.url().should('contain', '/Account/Login');
  });

  it('should be able to login by a login form', () => {
    cy.visit('/');
    cy.get('input[name="Username"]').type(Cypress.env('user_default'));
    cy.get('input[name="Password"]').type(Cypress.env('user_default_password'));
    cy.get('button[value="login"]').click();
    cy.url().should('contain', Cypress.config('baseUrl'));
  });

})
