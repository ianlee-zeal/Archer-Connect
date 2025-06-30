import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IdValue, Org } from '@app/models';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeeSplit } from '@app/models/billing-rule/fee-split';
import { ModalService } from '@app/services';
import { OrganizationSelectionModalComponent } from '@app/modules/shared/entity-selection-modal/organization-selection-modal.component';
import { IServerSideGetRowsParamsExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-params';
import * as sharedActions from '@app/modules/shared/state/entity-selection-modal/actions';
import { StringHelper } from '@app/helpers';
import * as selectors from '../../state/selectors';

export interface FeeSplitFormValue {
  org: IdValue;
  orgName: string;
  billTo: IdValue;
  feePercentage: string;
}

@Component({
  selector: 'app-fee-split',
  templateUrl: './fee-split.component.html',
  styleUrls: ['./fee-split.component.scss'],
})
export class FeeSplitComponent implements OnInit, OnDestroy {
  @Input() feeSplit: FeeSplit;
  @Output() feeSplitChange: EventEmitter<FeeSplit> = new EventEmitter();

  private ngUnsubscribe$ = new Subject<void>();

  public readonly organizations$ = this.store.select(selectors.orgs);

  constructor(
    private readonly modalService: ModalService,
    private readonly store: Store<any>,
  ) { }

  public form: UntypedFormGroup = new UntypedFormGroup({
    org: new UntypedFormControl(null, [Validators.required]),
    feePercentage: new UntypedFormControl(null, [Validators.required]),
  });

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((val: FeeSplitFormValue) => {
        const feeSplit: FeeSplit = {
          id: this.feeSplit.id,
          org: val.org,
          orgName: val.org.name,
          billTo: val.billTo,
          feePercentage: StringHelper.parseFloat(val.feePercentage, 0),
        };

        this.feeSplitChange.emit(feeSplit);
      });

    if (this.feeSplit) {
      this.form.patchValue(this.feeSplit, { emitEvent: false });
      this.form.updateValueAndValidity({ emitEvent: false });
    }
  }

  public openOrganizationSearchModal(): void {
    this.modalService.show(OrganizationSelectionModalComponent, {
      initialState: {
        onEntitySelected: (org: Org) => {
          this.form.patchValue({ org: new IdValue(org.id, org.name) });
          this.form.updateValueAndValidity();
        },
        gridDataFetcher: (params: IServerSideGetRowsParamsExtended) => this.store.dispatch(sharedActions.SearchOrganizations({ params })),
      },
      class: 'entity-selection-modal',
    });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
