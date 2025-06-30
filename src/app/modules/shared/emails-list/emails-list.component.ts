import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormArray, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';

import { MessageService } from '@app/services/message.service';
import { Email } from '@app/models';
import { CommonHelper } from '@app/helpers/common.helper';
import { Entity } from '../_interfaces/entity';
import { ValidationForm } from '../_abstractions/validation-form';
import { EmailValidator } from '../_validators/email-validator';

@Component({
  selector: 'app-emails-list',
  templateUrl: './emails-list.component.html',
  styleUrls: ['./emails-list.component.scss'],
})
export class EmailsListComponent extends ValidationForm implements OnInit, OnDestroy {
  @Input() entityParams: Entity;
  @Input() emails: Email[];
  @Output() emailsChanged = new EventEmitter<Email[]>();

  public form: UntypedFormGroup;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }

  private duplicateValidator = (control: AbstractControl) => {
    const newEmail = control.value;

    let matches = this.emailListGroup.controls.filter(i => i['controls'].email.value === newEmail).length;
    matches = this.newEmailGroup && this.newEmailGroup.controls.email.value === newEmail
      ? matches + 1
      : matches;

    return !!this.form && matches > 1
      ? { 'duplicatedEmail': true }
      : null;
  };

  constructor(
    private messageService: MessageService,
    private fb: UntypedFormBuilder,
    private emailValidator: EmailValidator,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm(this.emails);
  }

  public get canEdit(): boolean {
    return !!this.emailsChanged.observers.length;
  }

  public get newEmailGroup(): UntypedFormGroup {
    return this.form.get('newEmail') as UntypedFormGroup;
  }

  public get emailListGroup(): UntypedFormArray {
    return this.form.get('emailList') as UntypedFormArray;
  }
  public set emailListGroup(value: UntypedFormArray) {
    this.form.controls.emailList = value;
  }

  public get hasPrimary(): boolean {
    return !!this.emailListGroup.controls.find(с => с.value.isPrimary);
  }

  private initForm(emails: Email[] = null): void {
    this.form = this.fb.group({
      emailList: this.fb.array([]),
    });

    emails.forEach(e => {
      this.emailListGroup.push(this.createGroup(e));
    });
  }

  private createGroup(email: Email): UntypedFormGroup {
    return this.fb.group({
      id: email.id,
      email: [email.email, [Validators.required, this.emailValidator.valid, this.duplicateValidator]],
      isActive: email.isActive,
      isPrimary: email.isPrimary,
      entityType: email.entityType,
      entityId: email.entityId,
    });
  }

  public onAddNew(): void {
    this.form.addControl(
      'newEmail',
      this.createGroup(<Email>{
        id: 0,
        entityId: this.entityParams.entityId,
        entityType: this.entityParams.entityType,
        isActive: true,
        isPrimary: !this.hasPrimary,
      }),
    );
  }

  public onChange(): void {
    const dirty = this.emailListGroup.controls.find(i => !i.pristine) || this.newEmailGroup;

    if (dirty.invalid) return;

    const email = <Email>{
      ...dirty.value,
    };

    if (this.isNew(email)) {
      this.add(email);
    }

    dirty.reset(dirty.value);
    this.raiseEmailsChangedEvent();
  }

  private add(email: Email): void {
    this.emailListGroup.push(this.createGroup(email));

    this.form.removeControl('newEmail');
  }

  public onDelete(index): void {
    if (this.emailListGroup?.controls[index].value.id === 0) {
      this.deleteNewGroup(index);
    } else {
      this.messageService.showDeleteConfirmationDialog(
        'Confirm delete',
        'Are you sure you want to delete selected email?')
        .subscribe((answer: boolean) => {
          if (answer) {
            this.deleteExistEmail(index);
          }
        });
    }
  }

  private deleteNewGroup(index: number): void {
    this.emailListGroup.removeAt(index);
  }

  private deleteExistEmail(index: number): void {
    this.emailListGroup.removeAt(index);

    // If new email is in progress - update validation
    if (this.newEmailGroup) {
      this.newEmailGroup.controls['email'].updateValueAndValidity();
      this.onChange();
    } else {
      this.raiseEmailsChangedEvent();
    }
  }

  private raiseEmailsChangedEvent(): void {
    const changedEmails: Email[] = [];

    for (const e of this.emailListGroup.value) {
      changedEmails.push(e);
    }

    this.emailsChanged.emit(changedEmails);
  }

  private isNew(email: Email): boolean {
    return this.newEmailGroup && !email.id && CommonHelper.equals(
      email,
      <Email>{
        ...this.newEmailGroup.value,
      },
    );
  }

  public onCheckPrimary(emailObj: Email): void {
    const email = emailObj.email;

    for (const control of this.emailListGroup.controls) {
      if (control.value.email !== email) {
        control.patchValue({ isPrimary: false });
      }
    }

    if (this.newEmailGroup && this.newEmailGroup.value.number !== email) {
      this.newEmailGroup.patchValue({ isPrimary: false });
    }

    this.raiseEmailsChangedEvent();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
