import './login-manually';
import './wait-until-loaded';
import './repeat';
import './session';
import './grid/get-grid-filter';
import './grid/set-grid-filter';

import { WaitingStrategy } from './wait-until-loaded';

///

declare global {
  namespace Cypress {
    interface Chainable {

      /* Grids */
      getGridFilter(colIndex: number): Chainable<string>
      setGridFilter(colIndex: number, value: string | number): Chainable<JQuery<HTMLElement>>

      /* Session */
      loginManually(role?: string): Chainable<void>
      saveSession(snapshotName?: string): Chainable<void>
      restoreSession(snapshotName?: string): Chainable<void>

      /* Utils */
      waitUntilLoaded(strategy?: WaitingStrategy): Chainable<void>
      repeat(times: number, fn: (attempt: number) => void): Chainable<void>

    }
  }
}
