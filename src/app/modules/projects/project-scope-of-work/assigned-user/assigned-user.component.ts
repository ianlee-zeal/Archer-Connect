import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '@app/models/user';
import { ProjectProductCategory } from '@app/models/scope-of-work';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ModalService } from '@app/services';
import { UserSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/user-selection-modal.component';

@Component({
  selector: 'app-assigned-user',
  templateUrl: 'assigned-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignedUserComponent implements OnInit {
  @Input() canEdit: boolean;
  @Input() orgId: number | null;
  @Input() control: string;
  @Input() productCategory: ProjectProductCategory;
  @Output() onChange = new EventEmitter();

  public get assignedUser() : User {
    return this.form.controls.assignedUser.value;
  }

  public form: UntypedFormGroup = new UntypedFormGroup({
    assignedUser: new UntypedFormControl(''),
    assignedUserId: new UntypedFormControl(''),
  });

  constructor(
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.form.patchValue({ assignedUser: this.productCategory?.assignedUser?.displayName, assignedUserId: this.productCategory?.assignedUser?.id });
  }

  public onOpenModal(): void {
    this.modalService.show(UserSelectionModalComponent, {
      initialState: {
        onEntitySelected: (user: User) => {
          this.form.patchValue({ assignedUser: user.displayName, assignedUserId: user.id });
          this.form.updateValueAndValidity();
          this.form.markAsDirty();

          this.onChangeUser(user);
        },
        orgId: this.orgId,
      },
      class: 'user-selection-modal',
    });
  }

  public onChangeUser(user: User): void {
    const changedProductCategory = {
      ...this.productCategory,
      assignedUser: user,
      [this.control]: user?.id,
    };

    this.onChange.emit({ productCategory: ProjectProductCategory.toModel(changedProductCategory), isValidData: true });
  }

  public onClear(): void {
    this.form.patchValue({ assignedUser: null });
    this.onChangeUser(null);
  }
}
