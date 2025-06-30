import { OnDestroy, Component, ViewChild } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';

import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { EntityTypeEnum } from '@app/models/enums';
import { CreateDocumentComplete } from '@app/modules/shared/state/upload-document/actions';
import { ofType } from '@ngrx/effects';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DocumentsListComponent } from '@app/modules/shared/documents-list/documents-list.component';
import * as actions from '../state/actions';
import { DocumentTypesState } from '../state/reducer';

@Component({
  selector: 'app-documents-search',
  templateUrl: './documents-search.component.html',
  styleUrls: ['./documents-search.component.scss'],
})
export class DocumentsSearchComponent implements OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();

  public readonly gridId: GridId = GridId.Documents;
  public readonly entityTypeId: EntityTypeEnum = EntityTypeEnum.DocumentGeneration;

  @ViewChild(DocumentsListComponent) documentsList: DocumentsListComponent;

  constructor(
    private readonly store: Store<DocumentTypesState>,
    private readonly actionsSubject: ActionsSubject,
  ) {
    this.actionsSubject
      .pipe(
        ofType(CreateDocumentComplete),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(() => {
        this.documentsList.reloadGrid();
      });
  }

  onActionBarUpdated(actionBar: ActionHandlersMap) {
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
