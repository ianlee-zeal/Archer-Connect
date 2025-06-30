Cypress.Commands.add(
  'getGridFilter',
  { prevSubject: 'optional' },
  (subject: Cypress.JQueryWithSelector, colIndex: number) => {
    cy.get(q`%%grid-filters-column:nth-child(${colIndex + 1})`).then($filterColumn => {
      if ($filterColumn.has('select').length > 0)
        return $filterColumn.find('select option:selected').text().trim();

      if ($filterColumn.has('input[name="datepicker"]').length > 0)
        return $filterColumn.find('input[name="datepicker"]').val();

      return $filterColumn.find('input').val();
    });
});
