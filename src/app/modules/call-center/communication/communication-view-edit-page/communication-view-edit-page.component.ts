import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '@app/services';
import { Store } from '@ngrx/store';

import * as rootSelectors from '@app/state';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as projectsActions from '@app/modules/projects/state/actions';
import { sharedActions } from '@app/modules/shared/state';
import { ClaimantsState } from '../../../claimants/state/reducer';
import { communicationSelectors as selectors } from '../state/selectors';
import * as actions from '../state/actions';
import * as claimantDetailsActions from '../../../claimants/claimant-details/state/actions';

import { CommunicationPageBase } from '../communication-page-base';
import { ProjectsCommunicationEditPageComponent } from '../../projects-communication/projects-communication-edit-page/projects-communication-edit-page.component';
import { CommunicationEditPageComponent } from '../communication-edit-page/communication-edit-page.component';
import { PermissionTypeEnum } from '@app/models/enums';

@Component({
  selector: 'app-communication-view-edit-page',
  templateUrl: './communication-view-edit-page.component.html',
  styleUrls: ['./communication-view-edit-page.component.scss'],
})
export class CommunicationViewEditPageComponent extends CommunicationPageBase {
  @ViewChild(ProjectsCommunicationEditPageComponent) projectsCommunicationEditPageComponent: ProjectsCommunicationEditPageComponent;
  @ViewChild(CommunicationEditPageComponent) communicationEditPageComponent: CommunicationEditPageComponent;

  private readonly relatedDocumentsCount$ = this.store.select(selectors.currentCommunicationRelatedDocumentsCount);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);
  public claimantsParentPage: boolean;

  protected readonly canReadDocuments = this.permissionService.canRead(PermissionTypeEnum.ClientCommunicationsDocuments);

  constructor(
    private store: Store<ClaimantsState>,
    private route: ActivatedRoute,
    private router: Router,
    permissionService: PermissionService,
  ) {
    super(permissionService);
  }

  public ngOnInit(): void {
    const { params } = this.route.snapshot;
    const communicationId = parseInt(params.id, 10) || 0;

    super.ngOnInit();

    if (this.canReadDocuments){
      this.tabs.push({
        title: 'Related Documents',
        link: './related-documents',
        disabled: !communicationId,
        count: this.relatedDocumentsCount$,
      });
    }

    this.claimantsParentPage = this.router.url.split('/')[1] === GridId.Claimants;

    /*
    Hidden by AC-805
    */
    // {
    //   title: 'Audit Log',
    //   link: './audit-log',
    //   disabled: true,
    // }
    // ];
  }

  public get canLeave(): boolean {
    if (this.claimantsParentPage) {
      return this.communicationEditPageComponent.canLeave;
    }

    return this.projectsCommunicationEditPageComponent.canLeave;
  }

  ngOnDestroy(): void {
    if (this.claimantsParentPage) {
      this.store.dispatch(claimantDetailsActions.UpdateClaimantsActionBar({ actionBar: null }));
    } else {
      this.store.dispatch(projectsActions.UpdateActionBar({ actionBar: null }));
    }

    this.store.dispatch(actions.ResetCommunicationRecord());
    this.store.dispatch(sharedActions.notesListActions.CloseEditMode());
  }
}
