Cypress.Commands.add(
  'setGridFilter',
  { prevSubject: 'optional' },
  (subject: Cypress.JQueryWithSelector, colIndex: number, value: string | number) => {
    cy.get(q`%%grid-filters-column:nth-child(${colIndex + 1})`).then(($filterColumn) => {
      switch (true) {
        case $filterColumn.has('select').length > 0:
          cy.wrap($filterColumn).find('select').select(value);
          break;

        case $filterColumn.has('input[name="datepicker"]').length > 0:
          cy.wrap($filterColumn).find('input[name="datepicker"]').type(value.toString());
          break;

        default:
          cy.wrap($filterColumn).find('input').type(value.toString());
      }
    });
});
