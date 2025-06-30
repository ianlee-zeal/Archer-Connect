const sessionSnapshotMap: Record<string, SessionSnapshot> = {};

type StorageSnapshot = Record<string, string>;
interface SessionSnapshot {
  local: StorageSnapshot;
  session: StorageSnapshot;
}

///

Cypress.Commands.add('saveSession', (snapshotName: string = 'default') => {
  sessionSnapshotMap[snapshotName] = {
    local: Object.keys(localStorage).reduce(storageReducer.bind(localStorage), {}),
    session: Object.keys(sessionStorage).reduce(storageReducer.bind(sessionStorage), {}),
  }

  ///

  function storageReducer(snapshot: StorageSnapshot, key: string): StorageSnapshot {
    snapshot[key] = this[key];
    return snapshot;
  }
});

Cypress.Commands.add('restoreSession', (snapshotName: string = 'default') => {
  const snapshot = sessionSnapshotMap[snapshotName];
  if (!snapshot) return;

  for (let key in snapshot.local)
    localStorage.setItem(key, snapshot.local[key]);

  for (let key in snapshot.session)
    sessionStorage.setItem(key, snapshot.session[key]);

});
