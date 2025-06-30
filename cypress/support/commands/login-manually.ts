Cypress.Commands.add('loginManually', (role: string = 'default') => {
  cy.visit('/signin');
  cy.get('input[name="Username"]').type(Cypress.env(`user_${role}`));
  cy.get('input[name="Password"]').type(Cypress.env(`user_${role}_password`));
  cy.get('button[value="login"]').click();

  cy.intercept(`**/api/organizations/byCurrentUser`).as('org');
  cy.intercept(`**/api/users/*`).as('user');
  cy.intercept(`**/api/v2/permissions/current`).as('permissions');

  cy.wait(['@org', '@user', '@permissions'], { timeout: 20_000 });
});
