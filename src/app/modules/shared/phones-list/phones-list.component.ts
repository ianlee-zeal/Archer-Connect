import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import * as fromShared from '@shared/state';
import * as fromRoot from '@app/state';
import { MessageService } from '@app/services/message.service';
import { Phone, PhoneType } from '@app/models';
import { CommonHelper } from '@app/helpers/common.helper';
import { PermissionService } from '@app/services';
import { ValidationForm } from '../_abstractions/validation-form';
import { Entity } from '../_interfaces/entity';

@Component({
  selector: 'app-phones-list',
  templateUrl: './phones-list.component.html',
  styleUrls: ['./phones-list.component.scss'],
})
export class PhonesListComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() entityParams: Entity;
  @Input() phones: Phone[];
  @Output() phonesChanged = new EventEmitter<Phone[]>();
  @Input() editPermissions: string = null;

  public phoneTypes: PhoneType[] = [];

  public form: UntypedFormGroup;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  constructor(
    private store: Store<fromShared.AppState>,
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private readonly permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit() {
    this.initForm(this.phones);

    this.store.select(fromRoot.phoneTypesDropdownValues).pipe(
      filter(x => !!x),
      takeUntil(this.ngUnsubscribe),
    ).subscribe(items => {
      this.phoneTypes = <PhoneType[]>items;
    });
  }

  public get canEdit(): boolean {
    return (!this.editPermissions || this.permissionService.has(this.editPermissions))
           && !!this.phonesChanged.observers.length;
  }

  public get newPhoneGroup(): UntypedFormGroup {
    return this.form.get('newPhone') as UntypedFormGroup;
  }

  public get phoneListGroup(): UntypedFormArray {
    return this.form.get('phoneList') as UntypedFormArray;
  }

  public get hasPrimary(): boolean {
    return !!this.phoneListGroup.controls.find(с => с.value.isPrimary);
  }

  private duplicateValidator = (control: AbstractControl) => {
    if (!control.parent) {
      return null;
    }

    const newNumber = control.value;
    let matches: number;
    const phoneTypeId = control.parent.controls['phoneTypeId'].value;

    matches = this.phoneListGroup.controls.filter(i => i['controls'].number.value === newNumber && i['controls'].phoneTypeId.value === phoneTypeId).length;
    matches = this.newPhoneGroup && this.newPhoneGroup.controls.number.value === newNumber && this.newPhoneGroup.controls.phoneTypeId.value === phoneTypeId
      ? matches + 1
      : matches;

    return !!this.form && matches > 1
      ? { duplicatedPhoneNumber: true }
      : null;
  };

  private initForm(phones: Phone[] = null) {
    this.form = this.fb.group({ phoneList: this.fb.array([]) });

    phones.forEach(e => {
      this.phoneListGroup.push(this.createGroup(e));
    });
  }

  public onAddNew() {
    this.form.addControl('newPhone',
      this.createGroup(<Phone>{
        id: CommonHelper.createEntityUniqueId(),
        number: '',
        isActive: true,
        isPrimary: !this.hasPrimary,
        entityId: this.entityParams.entityId,
        entityType: this.entityParams.entityType,
      }));
  }

  private createGroup(phone: Phone): UntypedFormGroup {
    return this.fb.group({
      id: phone.id,
      number: [phone.number, [Validators.required, Validators.minLength(10), this.duplicateValidator]],
      isActive: phone.isActive,
      isPrimary: phone.isPrimary,
      entityType: phone.entityType,
      entityId: phone.entityId,
      phoneTypeId: [phone.phoneType ? phone.phoneType.id : 1],
      phoneType: phone.phoneType,
    });
  }

  public onChange(): void {
    const dirty = this.phoneListGroup.controls.find(i => !i.pristine)
      || this.newPhoneGroup;

    if (dirty.invalid) {
      return;
    }

    dirty.patchValue({ phoneType: this.phoneTypes.find(i => i.id === dirty.value.phoneTypeId) });

    const phone = <Phone>{ ...dirty.value };

    if (this.isNew(phone)) {
      this.add(phone);
    }

    dirty.reset(dirty.value);
    this.phoneListGroup.markAsPristine();

    this.raisePhonesChangedEvent();
  }

  private add(phone: Phone): void {
    this.phoneListGroup.push(this.createGroup(phone));
    this.deleteNewGroup();
  }

  public onDelete(index) {
    if (index == null) {
      this.deleteNewGroup();
    } else {
      this.messageService.showDeleteConfirmationDialog(
        'Confirm delete',
        'Are you sure you want to delete selected phone?',
      )
        .subscribe(answer => {
          if (answer) {
            this.deleteExistPhone(index);
          }
        });
    }
  }

  private deleteNewGroup() {
    this.form.removeControl('newPhone');
  }

  private deleteExistPhone(index: number) {
    this.phoneListGroup.removeAt(index);

    if (this.newPhoneGroup) {
      this.newPhoneGroup.controls.number.updateValueAndValidity();
      this.onChange();
    } else this.raisePhonesChangedEvent();
  }

  private raisePhonesChangedEvent() {
    const changedPhones: Phone[] = [];

    for (const e of this.phoneListGroup.value) {
      changedPhones.push({ ...e, id: e.id < 0 ? 0 : e.id });
    }

    this.phonesChanged.emit(changedPhones);
  }

  private isNew(phone: Phone): boolean {
    return this.newPhoneGroup && phone.id < 0 && CommonHelper.equals(phone,
      <Phone>{ ...this.newPhoneGroup.value });
  }

  public onCheckPrimary(selectedPhone: Phone) {
    const id = selectedPhone.id;

    for (const control of this.phoneListGroup.controls) {
      if (control.value.id !== id) {
        control.patchValue({ isPrimary: false });
      }
    }

    if (this.newPhoneGroup && this.newPhoneGroup.value.id !== id) {
      this.newPhoneGroup.patchValue({ isPrimary: false });
    }

    this.raisePhonesChangedEvent();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
