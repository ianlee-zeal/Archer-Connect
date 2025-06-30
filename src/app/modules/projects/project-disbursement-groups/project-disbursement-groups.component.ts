import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService, PermissionService } from '@app/services';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Project } from '@app/models';
import { filter, first, takeUntil } from 'rxjs/operators';
import { EntityTypeEnum, FileImportTemplateTypes, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { sharedSelectors, sharedActions } from 'src/app/modules/shared/state/index';
import { ClaimSettlementLedgerSettings } from '@app/models/ledger-settings';
import { DisbursementGroup } from '@app/models/disbursement-group';
import { DocumentImportTemplate } from '@app/models/documents';
import { Router } from '@angular/router';
import * as selectors from '../state/selectors';
import * as actions from '../state/actions';
import { ProjectsCommonState } from '../state/reducer';
import { CreateDisbursementGroupModalComponent } from './create-disbursement-group-modal/create-disbursement-group-modal.component';

@Component({
  selector: 'app-project-disbursement-groups',
  templateUrl: './project-disbursement-groups.component.html',
  styleUrls: ['./project-disbursement-groups.component.scss'],
})
export class ProjectDisbursementGroupsComponent implements OnInit, OnDestroy {
  public readonly project$ = this.store.select(selectors.item);
  private readonly disbursementsGroups$ = this.store.select(selectors.disbursementGroupList);
  public allowedExtensions$ = this.store.select(sharedSelectors.commonSelectors.allowedFileExtensions);
  private readonly ngUnsubscribe$ = new Subject<void>();
  currentProject: Project;
  public projectId: number;
  private allowedExtensions: string[] = [];
  private ledgerSettings: ClaimSettlementLedgerSettings;
  private electionFormRequired: boolean;

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly modalService: ModalService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.subscribeCurrentProject();
    this.updateActionBar();
    this.loadLedgerSettings();
    this.loadExtensions();
  }

  private updateActionBar(): void {
    this.store.dispatch(actions.UpdateActionBar({
      actionBar: {
        new: {
          callback: () => this.openCreateDisbursementGroupModal(),
          permissions: PermissionService.create(PermissionTypeEnum.DisbursementGroups, PermissionActionTypeEnum.Create),
          options: [
            { name: 'Create Group', callback: () => this.openCreateDisbursementGroupModal() },
            { name: 'Import Group', callback: () => this.openUploadBulkDocumentModal() },
          ],
        },
      },
    }));
  }

  private subscribeCurrentProject(): void {
    this.project$
      .pipe(
        filter((c: Project) => !!c),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((c: Project) => {
        this.currentProject = c;
        this.store.dispatch(actions.GetLedgerSettings({ projectId: this.currentProject.id }));
      });
  }

  private loadLedgerSettings(): void {
    this.store.select(selectors.ledgerSettings)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((settings: ClaimSettlementLedgerSettings) => {
        this.ledgerSettings = settings;
        this.electionFormRequired = this.ledgerSettings?.id ? this.ledgerSettings.electionFormRequired : true;
      });
  }

  private openCreateDisbursementGroupModal(): void {
    let sequence = 0;
    this.disbursementsGroups$.pipe(
      first(),
    ).subscribe((groups: DisbursementGroup[]) => {
      if (groups && groups.length) {
        sequence = Math.max(...groups.map((g: DisbursementGroup) => g.sequence || 0));
      }
    });

    const initialState = {
      title: 'Create Disbursement Group',
      projectId: this.currentProject.id,
      sequence: sequence + 1,
      electionFormRequired: this.electionFormRequired,
    };

    this.modalService.show(CreateDisbursementGroupModalComponent, {
      initialState,
      class: 'create-disbursement-group-modal',
    });
  }

  private openUploadBulkDocumentModal(): void {
    const disbursementGroupImportTemplate: DocumentImportTemplate = {
      id: FileImportTemplateTypes.DisbursementGroupAllocation,
      name: 'Ledger Import - Disbursement Group Allocation Import',
      config: null,
      isPrimary: false,
      provideTemplate: true,
      templateCategoryId: 2,
    };
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.SetDocumentImportTemplate({ selectedTemplate: disbursementGroupImportTemplate }));
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.OpenUploadBulkDocumentModal({
      entityId: this.currentProject.id,
      entityTypeId: EntityTypeEnum.Projects,
      importTypeId: EntityTypeEnum.Projects,
      allowedExtensions: this.allowedExtensions,
    }));
    this.router.navigate(['projects', this.currentProject.id, 'overview', 'tabs', 'imports']);
  }

  private loadExtensions(): void {
    this.store.dispatch(sharedActions.commonActions.GetMimeTypes());

    this.allowedExtensions$
      .pipe(
        filter((x: string[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((extensions: string[]) => { this.allowedExtensions = extensions; });
  }

  ngOnDestroy(): void {
    this.store.dispatch(actions.UpdateActionBar({ actionBar: null }));
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
