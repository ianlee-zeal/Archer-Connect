import { Component, Input, forwardRef, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as actions from '@app/modules/admin/bank-accounts/state/actions';

import { ofType } from '@ngrx/effects';
import { ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseControl } from '../_abstractions/base-control';

@Component({
  selector: 'app-editable-form-control',
  templateUrl: './editable-form-control.component.html',
  styleUrls: ['./editable-form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditableFormControlComponent),
      multi: true,
    },
  ],
})
export class EditableFormControlComponent extends BaseControl implements OnInit, OnDestroy, OnChanges {
  @Input() public fieldName: string;
  @Input() public model: string;
  @Input() public editPermissions: string | string[];
  @Input() public isApplyAutoFocus: boolean = true;
  @Input() public saveField = (_fieldName: string, _value: string) => { };
  @Input() public validate = (_fieldName: string, _value: string) => "";  // returns error message, or null if validated

  public value: string;
  public editedValue: string;
  public errMessage: string;
  public isEditingInProgress: boolean = false;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private readonly actionsSubj: ActionsSubject,
  ) {
    super();
  }

  ngOnInit(): void {
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.SaveIndividualFieldSuccess
      ),
    ).subscribe(data => {
      if (data.fieldName == this.fieldName) {
        this.isEditingInProgress = false;
      }
    });
    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(
        actions.SaveIndividualFieldError
      ),
    ).subscribe(data => {
      if (data.fieldName == this.fieldName) {
        this.isEditingInProgress = true;
        this.errMessage = data.error;
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { model } = this;
    const modelChange = changes["model"];

    if (modelChange) {
      if(this.isEditingInProgress && model!=this.value)
        this.errMessage = "Value changed while in edit mode. Hit Cancel to accept the changed value."
      this.value = model;
    }
  }

  public Edit() {
    this.editedValue = this.value;
    this.isEditingInProgress = true;
  }
  public Cancel() {
    this.errMessage = null;
    this.isEditingInProgress = false;
  }
  public Save() {
    this.errMessage = null;
    this.saveField(this.fieldName, this.editedValue);
  }

  public onChange(_: string): void {
    this.errMessage = this.validate(this.fieldName, this.editedValue);
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
