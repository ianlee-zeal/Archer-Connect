import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ValidationService } from '@app/services/validation.service';
import { equalControlsValueValidator } from '@app/validators/equal-controls-value.validator';

@Component({
  selector: 'app-password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss'],
})
export class PasswordChangeComponent implements OnInit {
  @Input() public labelWidth: number;
  @Input() public width: number;
  @Input() public header: string;
  @Input() public passwordForm: UntypedFormGroup;

  public newPasswordOnFocus: boolean = false;

  public get isPasswordConfirmed(): boolean {
    return this.passwordForm.hasError('notSame') && this.passwordForm.controls.confirmation.touched;
  }

  public ngOnInit(): void {
    this.passwordForm.controls.newPassword.setValidators(ValidationService.passwordValidator);
    this.passwordForm.setValidators([equalControlsValueValidator('newPassword', 'confirmation')]);
  }
}
