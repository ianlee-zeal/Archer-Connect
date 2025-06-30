import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { filter, takeUntil } from 'rxjs/operators';
import { PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';
import * as selectors from '../../state/selectors';
import { ClaimantDetailsState } from '../../state/reducer';
import { ValidationForm } from '../../../../shared/_abstractions/validation-form';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DocumentTemplate } from '../../../../../models/documents/document-generators';
import { LedgerInfo } from '../../../../../models/closing-statement';


@Component({
  selector: 'app-custom-cs-fields',
  templateUrl: './custom-cs-fields.component.html',
  styleUrls: ['./custom-cs-fields.component.scss'],
})
export class CustomCsFieldsComponent extends ValidationForm implements OnInit {
  @Input()
  isEditable: boolean = false;
  @Output()
  readonly change = new EventEmitter();
  private readonly ledgerInfo$ = this.store.select(selectors.ledgerInfo);
  public readonly canEditPermission = PermissionService.create(PermissionTypeEnum.ClaimantClosingStatement, PermissionActionTypeEnum.EditCustomClosingStatementFields);
  public form: UntypedFormGroup;
  public ngUnsubscribe$ = new Subject<void>();
  public ledger: LedgerInfo;
  public defaultDocumentTemplate: DocumentTemplate;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly store: Store<ClaimantDetailsState>,
    private readonly permissions: PermissionService,
  ) {
    super();
  }

  ngOnInit() {
    this.ledgerInfo$.pipe(filter(x => !!x), takeUntil(this.ngUnsubscribe$)).subscribe(item => {
      this.ledger = item;
      this.form = this.getForm();
    });
  }

  getForm(): UntypedFormGroup {
    return this.fb.group({
      field1: [this.ledger.customCS1, [Validators.maxLength(100)]],
      field2: [this.ledger.customCS2, [Validators.maxLength(100)]],
      field3: [this.ledger.customCS3, [Validators.maxLength(100)]],
      field4: [this.ledger.customCS4, [Validators.maxLength(100)]],
      field5: [this.ledger.customCS5, [Validators.maxLength(100)]],
    });
  }

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  public get isValid(): boolean {
    return this.form.valid;
  }

  public get editable() {
    return this.isEditable && this.permissions.has(this.canEditPermission) ;
  }

  public get fields(): string[] {
    return [
      this.form.get("field1").value,
      this.form.get("field2").value,
      this.form.get("field3").value,
      this.form.get("field4").value,
      this.form.get("field5").value];
  }

  public onChange() {
    this.change.emit(true);
  }
}
