import { Injectable } from '@angular/core';
import { MessageService } from '@app/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as actions from './actions';

@Injectable()
export class ExportsEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly messageService: MessageService,
  ) { }

  showAlertLienDataExportDuplicateError$ = createEffect(() => this.actions$.pipe(
    ofType(actions.ShowAlertLienDataExportDuplicateError),
    tap(() => {
      this.messageService.showAlertDialog(
        'Lien Data Export',
        'Duplicate Client ID\'s were found in your selection, please refine your search to include only one ledger per Client ID and try again.',
      );
    }),
  ), { dispatch: false });
}
