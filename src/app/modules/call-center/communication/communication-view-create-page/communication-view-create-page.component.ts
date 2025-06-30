import { GridId } from '@app/models/enums/grid-id.enum';
import { Component, ViewChild } from '@angular/core';
import { PermissionService } from '@app/services';
import { Store } from '@ngrx/store';

import { Router } from '@angular/router';
import * as projectsActions from '@app/modules/projects/state/actions';
import { ClaimantsState } from '../../../claimants/state/reducer';
import * as actions from '../state/actions';
import * as claimantDetailsActions from '../../../claimants/claimant-details/state/actions';
import { CommunicationPageBase } from '../communication-page-base';
import { ProjectsCommunicationCreatePageComponent } from '../../projects-communication/projects-communication-create-page/projects-communication-create-page.component';
import { CommunicationCreatePageComponent } from '../communication-create-page/communication-create-page.component';
import { communicationSelectors as selectors } from '../state/selectors';

@Component({
  selector: 'app-communication-view-create-page',
  templateUrl: './communication-view-create-page.component.html',
  styleUrls: ['./communication-view-create-page.component.scss'],
})
export class CommunicationViewCreatePageComponent extends CommunicationPageBase {
  @ViewChild(ProjectsCommunicationCreatePageComponent) projectsCommunicationCreatePageComponent : ProjectsCommunicationCreatePageComponent;
  @ViewChild(CommunicationCreatePageComponent) communicationCreatePageComponent: CommunicationCreatePageComponent;
  public claimantsParentPage: boolean;

  private readonly relatedDocumentsCount$ = this.store.select(selectors.currentCommunicationRelatedDocumentsCount);

  constructor(
    private store: Store<ClaimantsState>,
    private router: Router,
    permissionService: PermissionService,
  ) {
    super(permissionService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.tabs.push({
      title: 'Related Documents',
      link: './related-documents',
      disabled: this.claimantsParentPage,
      count: this.relatedDocumentsCount$,
    });

    if (this.router.url.includes(GridId.Claimants)) {
      this.claimantsParentPage = true;

      this.tabs.push({
        title: 'Audit Log',
        link: './audit-log',
        disabled: true,
      });
    }
  }

  public get canLeave(): boolean {
    if (this.claimantsParentPage) {
      return this.communicationCreatePageComponent.canLeave;
    }

    return this.projectsCommunicationCreatePageComponent.canLeave;
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.ResetCommunicationRecord());

    if (this.claimantsParentPage) {
      this.store.dispatch(claimantDetailsActions.UpdateClaimantsActionBar({ actionBar: null }));
    } else {
      this.store.dispatch(projectsActions.UpdateActionBar({ actionBar: null }));
    }
  }
}
