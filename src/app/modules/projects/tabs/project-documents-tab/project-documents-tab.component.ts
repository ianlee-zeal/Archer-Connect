import { Component, OnDestroy } from '@angular/core';
import { EntityTypeEnum } from '@app/models/enums';
import { GridId } from '@app/models/enums/grid-id.enum';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { Store } from '@ngrx/store';
import * as actions from '../../state/actions';
import * as fromProjects from '../../state';
import * as selectors from '../../state/selectors';

@Component({
  selector: 'app-project-documents-tab',
  templateUrl: './project-documents-tab.component.html',
})
export class ProjectDocumentsTabComponent implements OnDestroy {
  public entityTypeId = EntityTypeEnum.Projects;
  public readonly gridId: GridId = GridId.ProjectDocuments;

  public readonly entityTypeEnum = EntityTypeEnum;
  public readonly item$ = this.store.select(selectors.item);

  constructor(
    private readonly store: Store<fromProjects.AppState>,
  ) { }

  public onActionBarUpdated(actionBar: ActionHandlersMap): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
  }
}
