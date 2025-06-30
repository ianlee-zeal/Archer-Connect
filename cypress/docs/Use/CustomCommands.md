# Custom Commands
We also provide some custom commands that wraps some common used logic.

### Sessions
- `cy.loginManually()` \
Logins into the system through the login form.
- `cy.saveSession(snapshotName: string)` \
Creates snapshot of a content of local- and session- storages.
- `cy.restoreSession(snapshotName: string)` \
Restores a content of local- and session- storages from a snapshot.

### Grids
- `cy.getGridFilter(columnIndex: number)` - gets set filter's value for a column
- `cy.setGridFilter(columnIndex: number, value: string)` - sets filter for a column

### Other
- `cy.waitUntilLoaded()` - waits until the loading spinner is gone.
- `cy.repeat(times: number, fn: (attempt: number) => void)` - runs a passed function specified number of times 
