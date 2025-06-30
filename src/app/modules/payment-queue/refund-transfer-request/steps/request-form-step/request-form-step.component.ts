/* eslint-disable no-restricted-globals */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionsSubject, Store } from '@ngrx/store';
import { Channel } from 'pusher-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IdValue, Org, Project } from '@app/models';

import { ProjectsCommonState } from '@app/modules/projects/state/reducer';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { EnumToArrayPipe } from '@app/modules/shared/_pipes';
import { ModalService, ToastService } from '@app/services';
import { PusherService } from '@app/services/pusher.service';
import * as actions from '../../../state/actions';
import { ProjectSelectionModalComponent } from '@shared/entity-selection-modal/project-selection-modal.component';
import { QsfOrgSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/qsf-org-selection-modal.component';
import { OrgType } from '@app/models/enums/org-type.enum';
import { OrgIdNameAlt } from '@app/models/orgIdNameAlt';
import { ofType } from '@ngrx/effects';
import { sharedActions } from '@app/modules/shared/state';
import { DocumentImportTemplate } from '@app/models/enums/document-import-template.enum';

@Component({
  selector: 'app-request-form-step',
  templateUrl: './request-form-step.component.html',
  styleUrl: './request-form-step.component.scss',
})
export class RefundTransferRequestFormStepComponent extends ValidationForm implements OnInit, OnDestroy {
  private readonly ngUnsubscribe$ = new Subject<void>();
  private channel: Channel;
  private transferChannel: Channel;

  public fromBankAccounts: IdValue[] = [];
  public toBankAccounts: IdValue[] = [];

  public inputWidth = 298;
  public leftInputLabelWidth = 173;
  public rightInputLabelWidth = 202;

  public claimantAndDetailsFile: File;
  public additionalDocumentsFiles: File[];

  requestForm: UntypedFormGroup;

  @Output()
  readonly addManuallyClicked = new EventEmitter();

  get valid(): boolean {
    return (!this.requestForm || this.requestForm.valid);
  }

  get projectId(): number | null {
    return this.requestForm.get('projectId')?.value;
  }

  get projectName(): string | null {
    return this.requestForm.get('project')?.value;
  }

  public get transferFromOrgControl(): AbstractControl {
    return this.requestForm.get('transferFromOrgId');
  }

  public get transferToOrgControl(): AbstractControl {
    return this.requestForm.get('transferToOrgId');
  }

  public get transferToOrgName(): string | null {
    return this.requestForm.get('transferToOrg')?.value;
  }

  public get transferFromAccountControl(): AbstractControl {
    return this.requestForm.get('transferFromAccountId');
  }

  public get transferFromAccount(): string | null {
    return this.requestForm.get('transferFromAccount')?.value;
  }

  public get transferToAccountControl(): AbstractControl {
    return this.requestForm.get('transferToAccountId');
  }

  constructor(
    private readonly store: Store<ProjectsCommonState>,
    private readonly toaster: ToastService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly pusher: PusherService,
    private actionsSubj: ActionsSubject,
    private modalService: ModalService,
    private readonly enumToArrayPipe: EnumToArrayPipe,
  ) {
    super();
  }

  ngOnInit(): void {

    this.initEmptyForm();
    this.subscribeToOrgChanges();
    this.subscribeToBankAccountsList();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.channel) {
      this.channel.unsubscribe();
    }
    if (this.transferChannel) {
      this.transferChannel.unsubscribe();
    }
  }

  searchFn(): boolean {
    return true;
  }

  protected get validationForm(): UntypedFormGroup {
    return this.requestForm;
  }

  public downloadTemplate(): void {
    this.store.dispatch(sharedActions.uploadBulkDocumentActions.DownloadTemplate({ id: DocumentImportTemplate.RefundTransferRequest }));
  }

  public onOpenProjectModal(): void {
    this.modalService.show(ProjectSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Project) => this.onProjectSelected(entity),
        isShowSettlement: true
      },
      class: 'entity-selection-modal',
    });
  }

  private onProjectSelected(project: Project): void {
    this.requestForm.controls.project.patchValue(project.name);
    this.requestForm.controls.projectId.patchValue(project.id);
    this.requestForm.updateValueAndValidity();
    this.requestForm.markAsDirty();

    if (project.qsfOrgId != null) {
      this.store.dispatch(actions.GetOrg({ id: project.qsfOrgId }));
      this.actionsSubj.pipe(
        ofType(
          actions.GetOrgComplete,
        ),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((res: any) => {
        let orgName = OrgIdNameAlt.getQsfOrgName(res.data.name, res.data.altName);
        this.requestForm.controls.transferToOrg.patchValue(orgName);
        this.requestForm.controls.transferToOrgId.patchValue(res.data.id);
        this.requestForm.updateValueAndValidity();
        this.requestForm.markAsDirty();
      });
    }
    else {
      this.requestForm.controls.transferToOrg.patchValue(null);
      this.requestForm.controls.transferToOrgId.patchValue(null);
      this.requestForm.updateValueAndValidity();
      this.requestForm.markAsDirty();
    }
  }

  public onProjectClear(): void {
    this.requestForm.patchValue({ project: null, projectId: null });
    this.requestForm.updateValueAndValidity();
    this.requestForm.markAsDirty();
  }

  public onOpenQSFModal(title: string, name: string, id: string): void {
    this.modalService.show(QsfOrgSelectionModalComponent, {
      initialState: {
        onEntitySelected: (entity: Org) => this.onOrgSelect(entity, name, id),
        orgTypeIds: [OrgType.QualifiedSettlementFund, OrgType.QSFAdministrator],
        title: title,
      },
      class: 'qsf-org-selection-modal',
    });
  }

  private onOrgSelect(org: Org, name: string, id: string) {
    let orgName = OrgIdNameAlt.getQsfOrgName(org.name, org.altName);

    this.requestForm.patchValue({ [name]: orgName, [id]: org.id });
    this.requestForm.updateValueAndValidity();
    this.requestForm.markAsDirty();
  }

  public onQsfClear(name: string, id: string): void {
    this.requestForm.patchValue({ [name]: null, [id]: null });
    this.requestForm.updateValueAndValidity();
    this.requestForm.markAsDirty();
  }

  public onTransferFromAccountChange(bankAccountId: number): void {
    const bankAccountName = this.fromBankAccounts.find(p => p.id == bankAccountId).name;
    this.requestForm.patchValue({transferFromAccount: bankAccountName})
    this.requestForm.updateValueAndValidity();
    this.requestForm.markAsDirty();
  }

  public onAddManuallyClick(): void {
    this.addManuallyClicked.emit();
  }

  private initEmptyForm(): void {
    this.requestForm = this.formBuilder.group({
      projectId: [null, Validators.required],
      project: [''],
      transferFromOrgId: [null, Validators.required],
      transferFromOrg: [''],
      transferToOrgId: [null, Validators.required],
      transferToOrg: [''],
      transferFromAccountId: [null, Validators.required],
      transferToAccountId: [null, Validators.required],
      transferFromAccount: [''],
      transferToAccount: ['']
    });
  }

  private subscribeToOrgChanges(): void {
    this.transferFromOrgControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((newValue: number | null) => {
      if (newValue != null) {
        this.loadBankAccounts(newValue);
      } else {
        this.transferFromAccountControl.setValue(null);
        this.store.dispatch(actions.ClearOrgBankAccountsList());
        this.fromBankAccounts = [];
      }
    });

    this.transferToOrgControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((newValue: number | null) => {
      if (newValue != null) {
        this.loadBankAccounts(newValue);
      } else {
        this.transferToAccountControl.setValue(null);
        this.store.dispatch(actions.ClearOrgBankAccountsList());
        this.toBankAccounts = [];
      }
    });
  }

  private loadBankAccounts(orgId: number): void {
    this.store.dispatch(actions.GetOrgBankAccountsList({ orgId: orgId }));
  }

  private subscribeToBankAccountsList(): void {
    this.actionsSubj.pipe(
      ofType(
        actions.GetOrgBankAccountsListComplete,
      ),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(res => {
      if (this.transferFromOrgControl.value == res.orgId)
        this.fromBankAccounts = res.bankAccountsList;
      else if (this.transferToOrgControl.value == res.orgId)
        this.toBankAccounts = res.bankAccountsList;
    });
  }

  onClaimantAndDetailsFileSelected(files: File[]): void {
    this.claimantAndDetailsFile = files[0] || null;
  }

  onAdditionalDocumentsFilesSelected(files: File[]): void {
    this.additionalDocumentsFiles = files;
  }
}
