Cypress.Commands.add('repeat', (count: number, fn: (attempt: number) => void) => {
  for (let i = 0; i < count; i++) {
    fn(i + 1);
  }
});
