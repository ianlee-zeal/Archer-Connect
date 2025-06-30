import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IdValue, UserInfo } from '@app/models';
import { AdvancedSearchTypeEnum } from '@app/models/advanced-search/advanced-search-types.enum';
import { EntityTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { Policy } from '@app/modules/auth/policy';
import { PermissionService } from '@app/services';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import * as fromAuth from '@app/modules/auth/state';
import { Document } from '@app/models/documents';
import * as fromShared from '../state';
import * as documentUploadActions from '../state/upload-document/actions';
import { SelectOption } from '../_abstractions/base-select';

const { sharedSelectors } = fromShared;

@Component({
  selector: 'app-upload-document-advance-share',
  templateUrl: './upload-document-advance-share.component.html',
  styleUrls: ['./upload-document-advance-share.component.scss'],
})
export class UploadDocumentAdvanceShareComponent implements OnInit, OnDestroy {
  @Input() public entityId: number;
  @Input() public entityTypeId: number;
  @Input() public document: Document;
  @Output() public onFormChanged = new EventEmitter();

  public orgsOptions: SelectOption[];
  public orgsOptionsLoading: boolean = false;

  public defaultOrgs: IdValue[];
  public defaultOrgsLoading: boolean = false;
  public uploadForm: UntypedFormGroup;

  public shareTypes = AdvancedSearchTypeEnum;

  public orgsOptions$ = this.store.select(sharedSelectors.uploadDocumentSelectors.orgsOptions);
  public orgsOptionsLoading$ = this.store.select(sharedSelectors.uploadDocumentSelectors.orgsOptionsLoading);
  public defaultOrgs$ = this.store.select(sharedSelectors.uploadDocumentSelectors.defaultOrgs);
  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    return this.uploadForm;
  }

  public get defaultOrgsAreLoading(): boolean {
    return [EntityTypeEnum.Projects, EntityTypeEnum.Matter].includes(this.entityTypeId)
      && this.permissionService.has(PermissionService.create(Policy.getDocuments(+this.entityTypeId), PermissionActionTypeEnum.SetDocumentPublicFlag));
  }

  public get isSharedChecked() : boolean {
    return this.uploadForm.controls.shareType.value === this.shareTypes.OrgLevel;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store<fromShared.AppState>,
    private permissionService: PermissionService,
  ) {

  }

  ngOnInit(): void {
    this.createForm();
    this.user$.pipe(
      filter((user: UserInfo) => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.initForm();

      if (!this.document) {
        return;
      }
      const { isPublicVal, shareTypeVal, shareWithVal } = this.calculateShareValues();
      this.uploadForm.patchValue({
        isPublic: isPublicVal,
        shareType: shareTypeVal,
        shareWith: shareWithVal,
      });
      this.toggleShareValidators();
    });
  }

  public removeOrgOption(item: any): void {
    const id = item?.data?.id;
    const filteredItems = this.uploadForm.controls.shareWith?.value?.filter((itm: any) => itm.id !== id);
    this.uploadForm.controls.shareWith.setValue(filteredItems, { emitEvent: false });
    this.onFormChanged.emit();
  }

  public onChangeType(): void {
    this.toggleShareWithValidator(true);
  }

  private initForm(): void {
    this.fillForm();

    this.orgsOptions$
      .pipe(
        filter((x: SelectOption[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((orgsOptions: SelectOption[]) => {
        this.orgsOptions = [...orgsOptions];
      });
    this.orgsOptionsLoading$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((inProgress: boolean) => {
        this.orgsOptionsLoading = inProgress;
      });

    const entityId = this.entityId ? this.entityId : this.document?.documentLinks[0]?.entityId;
    if (entityId && (this.entityTypeId === EntityTypeEnum.Projects || this.entityTypeId === EntityTypeEnum.Matter)) {
      this.store.dispatch(documentUploadActions.LoadDefaultOrgs({
        entityTypeId: this.entityTypeId,
        entityId,
      }));
      this.defaultOrgsLoading = true;
    }

    this.defaultOrgs$
      .pipe(
        filter((x: IdValue[]) => !!x),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe((defaultOrgs: IdValue[]) => {
        this.defaultOrgsLoading = false;
        this.defaultOrgs = defaultOrgs;

        if (this.isSharedChecked) {
          if (!this.document || (this.document && this.uploadForm.controls.shareType.dirty)
          ) {
            const items = (this.uploadForm.controls.shareWith?.value || []) as IdValue[];
            const newItems = items.concat(this.defaultOrgs)
              .filter((value: IdValue, index: number, self: IdValue[]) => self.findIndex((i: IdValue) => i.id === value.id) === index);// get distinct

            this.uploadForm.controls.shareWith.setValue(newItems, { emitEvent: false });
          }
        }
      });
  }

  private toggleShareWithValidator(isSetValue: boolean): void {
    const control = this.uploadForm.controls.shareWith;
    if (this.isSharedChecked) {
      control.enable();
      control.setValidators(Validators.required);
      if (isSetValue) { control.setValue(this.defaultOrgs, { emitEvent: false }); }
      control.updateValueAndValidity();
    } else {
      control.disable();
      control.setValidators(null);
      if (isSetValue) { control.setValue(null, { emitEvent: false }); }
      control.updateValueAndValidity();
    }
  }

  private createForm(): void {
    this.uploadForm = this.fb.group({
      isPublic: [false],
      shareType: [this.shareTypes.Private],
      shareWith: [null],
    });
  }

  private toggleShareValidators(): void {
    this.toggleShareWithValidator(false);
  }

  onFormChange(): void {
    this.onFormChanged.emit();
  }

  private calculateShareValues(): {
    isPublicVal: boolean;
    shareTypeVal: AdvancedSearchTypeEnum.Private | AdvancedSearchTypeEnum.OrgLevel;
    shareWithVal: any;
  } {
    const isPublicVal = this.document?.documentLinks[0]?.isPublic ?? false;
    const shareTypeVal = isPublicVal ? this.shareTypes.OrgLevel : this.shareTypes.Private;
    const shareWithVal = this.document?.organizationAccesses.map((org: IdValue) => ({ id: org.id, name: `${org.id}-${org.name}` })) ?? [];
    return { isPublicVal, shareTypeVal, shareWithVal };
  }

  private fillForm(): void {
    if (!this.document) {
      return;
    }

    const { isPublicVal, shareTypeVal, shareWithVal } = this.calculateShareValues();

    this.uploadForm.patchValue({

      isPublic: isPublicVal,
      shareType: shareTypeVal,
      shareWith: shareWithVal,
    });
    this.toggleShareValidators();
  }

  public fetch(term: any): void {
    this.store.dispatch(documentUploadActions.GetOrgsOptionsRequest({ search: term }));
  }

  public searchFn(): boolean {
    return true;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
