import { Dictionary } from '@app/models/utils/dictionary';
import { DocumentType } from '@app/models/documents';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionsSubject, Store } from '@ngrx/store';
import { MultiSelectOption } from '@app/modules/shared/multiselect-list/multiselect-list.component';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { ofType } from '@ngrx/effects';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { FormInvalid } from '@app/modules/shared/state/common.actions';
import { ValidationService } from '@app/services/validation.service';
import { EntityDocumentType } from '../../../../models/documents/entity-document-type';
import { DocumentTypesState } from '../state/reducer';
import * as actions from '../state/actions';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-add-new-document-type-modal',
  templateUrl: './add-new-document-type-modal.component.html',
  styleUrls: ['./add-new-document-type-modal.component.scss'],
})
export class AddNewDocumentTypeModalComponent extends ValidationForm implements OnInit {
  public title: string;
  public documentTypeId: number;
  public productCategories: SelectOption[];
  public entityTypes: SelectOption[];
  public entityTypesSelected = new Dictionary<number, number>();
  public isAllEntityTypesChecked = false;
  public isFormValid: boolean = true;

  public documentType$ = this.store.select(selectors.documentType);
  public productCategories$ = this.store.select(selectors.productCategories);
  public entityTypes$ = this.store.select(selectors.entityTypes);
  private ngUnsubscribe$ = new Subject<void>();

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public readonly statuses = [
    { id: true, name: 'Active' },
    { id: false, name: 'Inactive' },
  ];
  public readonly awaitedSaveActionTypes = [
    actions.CreateDocumentTypeComplete.type,
    actions.UpdateDocumentTypeComplete.type,
    actions.Error,
    FormInvalid.type];

  public form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(null),
    name: new UntypedFormControl(null, [Validators.required, ValidationService.noWhitespaceBeforeTextValidator]),
    description: new UntypedFormControl(null),
    entityTypeId: new UntypedFormControl(null),
    entityTypeIds: new UntypedFormControl(null),
    productCategoryId: new UntypedFormControl(null),
    isActive: new UntypedFormControl(this.statuses[0].id),
  });

  constructor(
    private store: Store<DocumentTypesState>,
    private modalWindow: BsModalRef,
    private readonly actionsSubj: ActionsSubject,
  ) { super(); }

  ngOnInit(): void {
    if (this.documentTypeId) {
      this.store.dispatch(actions.GetDocumentTypeById({ id: this.documentTypeId }));
      this.form.get('entityTypeId').setValidators(Validators.required);
    } else {
      this.form.get('entityTypeIds').setValidators(Validators.required);
    }
    this.form.updateValueAndValidity();

    this.store.dispatch(actions.GetProductCategoriesRequest());
    this.store.dispatch(actions.GetEntityTypesRequest());

    this.documentType$.pipe(
      filter(documentType => !!documentType),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe((documentType: DocumentType) => {
      if (this.documentTypeId) {
        this.form.patchValue({
          id: documentType.id,
          name: documentType.name,
          description: documentType.description,
          entityTypeId: documentType.entityType?.id,
          productCategoryId: documentType.productCategory?.id,
          isActive: documentType.isActive ? this.statuses[0].id : this.statuses[1].id,
        });
      }
    });

    this.entityTypes$.pipe(
      first(entityTypes => !!entityTypes && entityTypes.length > 0),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(entityTypes => {
      this.entityTypes = [...entityTypes];
    });

    this.actionsSubj.pipe(
      ofType(actions.CreateDocumentTypeComplete, actions.UpdateDocumentTypeComplete),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(() => {
      this.cancel();
    });
  }

  public save() {
    const documentType = EntityDocumentType.toDto({ ...this.form.getRawValue() });

    if (documentType.id) {
      this.store.dispatch(actions.UpdateDocumentType({ documentType }));
    } else {
      this.store.dispatch(actions.CreateDocumentType({ documentType }));
    }
  }

  public cancel() {
    this.modalWindow.hide();
  }

  public onSelectEntityType({ id, checked, index }: MultiSelectOption): void {
    this.entityTypes[index] = { ...this.entityTypes[index], checked };
    if (this.isAllEntityTypesChecked && !checked) {
      this.isAllEntityTypesChecked = false;
    }
    this.toggleEntityType(id, checked);
  }

  public onSelectAllEntityTypes(checked: boolean): void {
    this.entityTypes$.pipe(
      filter(entityTypes => !!entityTypes),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(entityTypes => {
      entityTypes.forEach((type, index) => {
        this.entityTypes[index] = { ...type, checked };
        this.toggleEntityType(+type.id, checked);
      });
      this.isAllEntityTypesChecked = checked;
    });
  }

  private toggleEntityType(id: number, checked: boolean): void {
    if (checked) {
      this.entityTypesSelected.setValue(id, id);
    } else {
      this.entityTypesSelected.remove(id);
    }
    this.form.patchValue({ entityTypeIds: this.entityTypesSelected.keys() });
  }
}
