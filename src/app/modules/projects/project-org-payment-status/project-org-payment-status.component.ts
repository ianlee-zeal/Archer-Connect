import { Component } from '@angular/core';
import { IdValue, Org, Project } from '@app/models';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProjectsCommonState } from '../state/reducer';
import * as selectors from '../state/selectors';
import { ModalService } from '@app/services';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import { FilterTypes } from '@app/models/advanced-search/filter-types.enum';
import { sharedActions } from '@app/modules/shared/state';
import * as projectActions from '../state/actions';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms'
import { FilterModel } from '@app/models/advanced-search/filter-model';

@Component({
  selector: 'app-project-org-payment-status',
  templateUrl: './project-org-payment-status.component.html',
  styleUrls: ['./project-org-payment-status.component.scss'],
})
export class ProjectOrgPaymentStatusComponent {
  public readonly project$ = this.store.select(selectors.item);
  public readonly projectOrgs$ = this.store.select(selectors.projectOrgs);
  private readonly ngUnsubscribe$ = new Subject<void>();
  public formGroup: UntypedFormGroup = new UntypedFormGroup({
    organization: new UntypedFormControl(null),
  });

  currentProject: Project;
  selectedOrganization: IdValue;
  projectOrganizationIds: number[];
  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly modalService: ModalService,
  ) { }
  ngOnInit(): void {
    this.subscribeCurrentProject();
    this.subscribeProjectOrgs();
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter(project => !!project),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((project: Project) => {
        this.currentProject = project;
        this.store.dispatch(projectActions.GetProjectOrgs({ projectId: project.id }));
      });
  }

  private subscribeProjectOrgs(): void {
    this.projectOrgs$.pipe(
      filter(projectOrgs => !!projectOrgs),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(projectOrgs => {
      if (projectOrgs.length != 0) {
        const firstOrg = projectOrgs[0];
        this.selectedOrganization = {
          name: firstOrg.organizationName,
          id: firstOrg.id
        };
        this.formGroup.patchValue({ organization: firstOrg.organizationName });
      }

      this.projectOrganizationIds = projectOrgs.map(p => p.id).filter((val, index, arr) => arr.indexOf(val) === index);
    });
  }

  public onOpenOrganizationModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrganizationSelected(entity),
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => {
          params.request.filterModel.push(new FilterModel({
            filter: true,
            filterType: FilterTypes.Boolean,
            type: 'equals',
            key: 'active',
          }));
          params.request.filterModel.push(new FilterModel({
            filter: this.projectOrganizationIds.toString(),
            filterType: FilterTypes.Number,
            type: 'contains',
            key: 'id',
          }));
          this.store.dispatch(sharedActions.entitySelectionActions.SearchOrganizations({ params }));
        },
      },
      class: 'entity-selection-modal',
    });
  }

  private onOrganizationSelected(organization: Org): void {
    this.selectedOrganization = {
      name: organization.name,
      id: organization.id
    };
    this.formGroup.patchValue({ organization: organization.name });
    this.formGroup.updateValueAndValidity();
  }

  public onClear(): void {
    this.formGroup.patchValue({ organization: null });
    this.selectedOrganization = null;
    this.formGroup.updateValueAndValidity();
  }
}
