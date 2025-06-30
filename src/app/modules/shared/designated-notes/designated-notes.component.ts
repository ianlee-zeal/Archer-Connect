import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ValidationForm } from '../_abstractions/validation-form';

@Component({
  selector: 'app-designated-notes',
  templateUrl: 'designated-notes.component.html',
})

export class DesignatedNotesComponent extends ValidationForm implements OnInit {
  @Input() public canEdit: boolean = true;
  @Input() public notes: string = '';

  public form: UntypedFormGroup = new UntypedFormGroup({
    designatedNotes: new UntypedFormControl(this.notes, [Validators.maxLength(256)]),
  });

  public ngOnInit(): void {
    this.form.patchValue({ designatedNotes: this.notes });
  }

  public get validationForm(): UntypedFormGroup {
    return this.form;
  }
}
