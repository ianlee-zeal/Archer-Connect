import { ModalService } from '@app/services/modal.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ValidationForm } from '@app/modules/shared/_abstractions/validation-form';
import { Store } from '@ngrx/store';
import { ChipListOption } from '@app/models/chip-list-option';
import { SelectOption } from '@app/modules/shared/_abstractions/base-select';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IdValue } from '@app/models';
import { PacketRequestsStatuses } from '@app/models/enums/packet-requests-statuses.enum';
import * as actions from '../../state/actions';

export interface IExportPendingPacketRequestsModalData {
  statusesIds: number[];
}

const DEFAULT_STATUSES = [{
  id: PacketRequestsStatuses.Requested,
  name: PacketRequestsStatuses[PacketRequestsStatuses.Requested],
  checked: true,
},
{
  id: PacketRequestsStatuses.ResendRequested,
  name: PacketRequestsStatuses[PacketRequestsStatuses.ResendRequested],
  checked: true,
}];

@Component({
  selector: 'app-export-pending-packet-requests-modal',
  templateUrl: './export-pending-packet-requests-modal.component.html',
  styleUrls: ['./export-pending-packet-requests-modal.component.scss'],
})
export class ExportPendingPacketRequestsModalComponent extends ValidationForm implements OnInit {
  title: string;
  stages: IdValue[];
  saveHandler: (data: IExportPendingPacketRequestsModalData) => (void) = null;

  public statusesDropdownOpts: SelectOption[] = [...DEFAULT_STATUSES];
  public checkedStatusesDropdownOpts: SelectOption[] = [...DEFAULT_STATUSES];

  private ngUnsubscribe$ = new Subject<void>();

  awaitedActionTypes = [
    actions.DownloadProbatesDocument.type,
    actions.Error.type,
  ];

  form = new UntypedFormGroup({ statusesIds: new UntypedFormControl([], Validators.required) });

  protected get validationForm(): UntypedFormGroup {
    return this.form;
  }

  get isSaveDisabled(): boolean {
    return this.form.get('statusesIds').value?.length === 0;
  }

  get areAllStagesSelected(): boolean {
    return this.checkedStatusesDropdownOpts.length === this.statusesDropdownOpts.length;
  }

  constructor(
    public readonly store: Store<any>,
    public readonly modalService: ModalService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToStatusesChange();
    this.updateStatusesDropdownOptions(
      DEFAULT_STATUSES.map(p => ({
        id: (+p.id).toString(),
        name: p.name.toString(),
        isRemovable: true,
      } as ChipListOption)),
    );
    this.form.controls.statusesIds.setValue(this.checkedStatusesDropdownOpts);
  }

  private subscribeToStatusesChange() {
    this.form.controls.statusesIds.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((statusesIds: ChipListOption[]) => {
        this.updateStatusesDropdownOptions(statusesIds);
      });
  }

  public onClear(controlName: string): void {
    this.form.get(controlName).setValue(null);
    this.form.updateValueAndValidity();
  }

  onSave(): void {
    if (this.saveHandler) {
      this.saveHandler({ statusesIds: this.checkedStatusesDropdownOpts.map(opt => +opt.id) });
    }
  }

  onCancel(): void {
    this.modalService.hide();
  }

  private updateStatusesDropdownOptions(alreadySelectedStatuses: ChipListOption[]): void {
    const updatedStatusesDropdownOpts: SelectOption[] = [];

    for (const t of this.stages) {
      updatedStatusesDropdownOpts.push({
        id: t.id,
        name: t.name,
        checked: alreadySelectedStatuses.some(bt => +bt.id === t.id),
      });
    }

    this.statusesDropdownOpts = updatedStatusesDropdownOpts;
    this.checkedStatusesDropdownOpts = updatedStatusesDropdownOpts.filter(bt => bt.checked);
  }

  public onStageChange(option: SelectOption, controlName: string) {
    if (!option) {
      this.form.patchValue({ [controlName]: [] });
      return;
    }

    const existingStatuses: ChipListOption[] = this.form.value[controlName];
    const patch = { [controlName]: existingStatuses };

    if (option.checked && !existingStatuses.some(t => +t.id === option.id)) {
      patch[controlName] = [...existingStatuses, { id: option.id.toString(), name: option.name, isRemovable: true }];
    } else if (!option.checked) {
      patch[controlName] = existingStatuses.filter(t => +t.id !== option.id);
    }

    this.form.patchValue(patch);
    this.form.updateValueAndValidity();
  }
}
