import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren, ViewRef } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppliedPaymentTypeEnum } from '@app/models/enums/applied-payment-type.enum';
import { RefundTransferItem } from '@app/models/refund-transfer-request/refund-transfer-item';
import { catchError, of, Subject, take } from 'rxjs';
import { ClientsService, ToastService, ValidationService } from '@app/services';
import { IdValue } from '@app/models';

@Component({
  selector: 'app-manual-entry-step',
  templateUrl: './manual-entry-step.component.html',
  styleUrl: './manual-entry-step.component.scss',
})
export class ManualEntryStepComponent implements OnInit, OnDestroy {
  @ViewChildren('clientIdInput') clientIdInputs!: QueryList<ElementRef>;
  @Input() isActive: boolean = false;

  ngOnInit(): void {
    this.onAddManualEntry();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isActive && changes.isActive.currentValue === true) {
      this.focusOnLastClientId();
    }
  }

  errors: { [key: number]: { [key: string]: boolean } } = {};
  public tooltip: string = 'Lien ID is required when Lien Payment type is selected';
  public form: UntypedFormGroup;
  // public readonly claimant$ = this.store.select(selectors.item);
  private readonly ngUnsubscribe$ = new Subject<void>();

  public currentPage = 1;
  public itemsPerPage = 8;
  public totalEntries = 0;

  public get entries(): UntypedFormArray {
    return this.form.get('entries') as UntypedFormArray;
  }

  public getEntriesAsItems(): RefundTransferItem[] {
    return this.entries.value as RefundTransferItem[];
  }

  public get pagedEntries(): UntypedFormGroup[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.entries.controls.slice(startIndex, endIndex) as UntypedFormGroup[];
  }

  get totalPages(): number {
    return Math.ceil(this.entries.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const totalPagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      totalPagesArray.push(i);
    }
    return totalPagesArray;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private readonly changeRef: ChangeDetectorRef,
    private readonly clientsService: ClientsService,
    private toaster: ToastService,
  ) {
  }

  public paymentTypes: IdValue[] = [
    { id: AppliedPaymentTypeEnum.Default, name: 'Default' },
    { id: AppliedPaymentTypeEnum.Lien, name: 'Lien Payment' },
    { id: AppliedPaymentTypeEnum.CBF, name: 'CBF' },
    { id: AppliedPaymentTypeEnum.Claimant, name: 'Claimant Net' },
    { id: AppliedPaymentTypeEnum.MDL, name: 'MDL' },
    { id: AppliedPaymentTypeEnum.PrimaryFirmExpenses, name: 'Primary Firm Expenses' },
    { id: AppliedPaymentTypeEnum.PrimaryFirmFees, name: 'Primary Firm Fees' },
    { id: AppliedPaymentTypeEnum.ReferringFirmExpenses, name: 'Referring Firm Expenses' },
    { id: AppliedPaymentTypeEnum.ReferringFirmFees, name: 'Referring Firm Fees' },
    { id: AppliedPaymentTypeEnum.SettlementCounselExpenses, name: 'Settlement Firm Expenses' },
    { id: AppliedPaymentTypeEnum.SettlementCounselFees, name: 'Settlement Firm Fees' },
    { id: AppliedPaymentTypeEnum.Vendor, name: 'Vendor' },
  ];

  getClaimantData(index: number): void {
    const row = this.entries.at(index);

    if (row.get('clientId').valid) {
      const claimantId = row.get('clientId').value;

      // Fetch claimant data directly from the service
      this.clientsService.getBasicInfo(claimantId).pipe(
        take(1),
        catchError(() => {
          this.toaster.showError('Failed to fetch claimant data. Please try again.');
          return of(null);
        }),
      ).subscribe((claimant: any) => {
        if (claimant) {
          row.patchValue({
            firstName: claimant.firstName,
            lastName: claimant.lastName,
          });
        }
      });
    }
  }

  public onAddManualEntry(): void {
    if (!this.form) {
      this.form = this.fb.group({ entries: this.fb.array([]) });
    }
    const manualEntry = <RefundTransferItem> {
      clientId: undefined,
      firstName: '',
      lastName: '',
      lienId: undefined,
      paymentType: undefined,
      amount: undefined,
    };
    const newEntry = this.createManualEntryFormGroup(manualEntry);
    this.entries.push(newEntry);
    this.totalEntries = this.entries.length;

    this.detectChanges();

    this.focusOnLastClientId();
  }

  private createManualEntryFormGroup(entry: RefundTransferItem): UntypedFormGroup {
    const group = this.fb.group({
      clientId: [entry.clientId, [Validators.required, ValidationService.onlyNumbersValidator]],
      firstName: entry.firstName,
      lastName: entry.lastName,
      lienId: [entry.lienId, ValidationService.onlyNumbersValidator],
      paymentType: [entry.paymentType, [Validators.required, ValidationService.onlyNumbersValidator]],
      amount: [entry.amount, [Validators.required]],
    });

    group.get('paymentType')?.valueChanges.subscribe(paymentType => {
      const lienIdControl = group.get('lienId');
      if (paymentType === AppliedPaymentTypeEnum.Lien) {
        lienIdControl?.setValidators([Validators.required, ValidationService.onlyNumbersValidator]);
      } else {
        lienIdControl?.clearValidators();
        lienIdControl?.setValidators([ValidationService.onlyNumbersValidator]);
      }
      lienIdControl?.updateValueAndValidity();
    });

    return group;
  }

  private focusOnLastClientId(): void {
    setTimeout(() => {
      const inputsArray = this.clientIdInputs.toArray();
      if (inputsArray.length > 0) {
        const lastInput = inputsArray[inputsArray.length - 1];
        lastInput.nativeElement.focus();
      }
    }, 0);
  }

  public onRemoveManualEntry(index: number): void {
    if (this.entries.length > 0 && index >= 0 && index < this.entries.length) {
      this.entries.removeAt(index);
      this.totalEntries = this.entries.length;
      this.detectChanges();
    }
  }

  public detectChanges(): void {
    if (this.changeRef && !(this.changeRef as ViewRef).destroyed) {
      this.changeRef.detectChanges();
    }
  }

  public toPage(pageNumber: number): void {
    this.currentPage = pageNumber;
  }

  get isPrevButtonsShow(): boolean {
    return this.currentPage !== 1;
  }

  get isNextButtonsShow(): boolean {
    return this.currentPage !== this.totalPages;
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Method to navigate to the previous page
  public prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
