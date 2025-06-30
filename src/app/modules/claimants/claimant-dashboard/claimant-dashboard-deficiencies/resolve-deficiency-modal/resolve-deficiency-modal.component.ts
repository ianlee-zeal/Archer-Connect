import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ClaimantDeficiency } from '@app/models/claimant-deficiency';
import { ModalService } from '@app/services';
import { DeficiencyExpectedDataType } from '@app/models/enums/claimant-deficiencies/deficiency-expected-data-type.enum';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DeficiencyDataTypeHelper } from '@app/helpers/deficiency-data-type.helper';
import { IDeficiencyResolution, IDeficiencyResolutionWithFiles } from '@app/models/claimant-deficiency-resolution';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Action, Store } from '@ngrx/store';
import * as claimantActions from '@app/modules/claimants/claimant-details/state/actions';
import * as clientListActions from '@app/modules/shared/state/clients-list/actions';
import { IDeficiencyResolutionFile } from '@app/models/claimant-deficiency-resolution-file';
import { FilesSelectorComponentV2 } from '@app/modules/shared/files-selector-v2/files-selector-v2.component';
import { filter, Subject, takeUntil } from 'rxjs';
import { DateFormatPipe } from '@shared/_pipes';
import {
  DeficiencyTypeExpectedResponse
} from '@app/models/enums/claimant-deficiencies/deficiency-type-expected-response.enum';
import * as fromClaimant from '@app/modules/claimants/claimant-details/state/selectors';
import { FileHelper } from '@app/helpers/file.helper';

interface DeficiencyResponseDetail {
  deficiencyId: number;
  deficiencyTypeExpectedResponseId: number;
  responseValue: string[];
  responseNote: string;
}

@Component({
  selector: 'app-resolve-deficiency-modal',
  templateUrl: './resolve-deficiency-modal.component.html',
  styleUrl: './resolve-deficiency-modal.component.scss'
})

export class ResolveDeficienciesModalComponent implements OnInit, OnDestroy {
  @ViewChild(FilesSelectorComponentV2) filesSelector: FilesSelectorComponentV2;

  title: string = 'Deficiency Details';
  clientId: number;
  caseId: number;
  deficiencies: ClaimantDeficiency[] = [];

  currentDeficiencyIndex: number = 0;

  deficiencyResponses: { [key: number]: DeficiencyResponseDetail } = {};
  currentDeficiencyDataType: string;

  responseValuesForm: FormGroup = this.fb.group({});
  inputNote: string = '';
  inputDatesValidity: boolean = true;

  isMultipleDeficiencies: boolean = false;
  DeficiencyExpectedDataType = DeficiencyExpectedDataType;
  onSubmitFinished: Function;

  public pendingDeficiency$ = this.store.select(fromClaimant.pendingDeficiencies);

  private deficiencyFiles: { [key: number]: IDeficiencyResolutionFile[] } = {};
  protected currentDeficiencyFiles: File[] = [];
  protected maxFileSize: number = 500 * 1024 * 1024;
  protected maxFiles: number = 5;

  private readonly ngUnsubscribe = new Subject<void>();

  protected readonly awaitedActionTypes = [
    claimantActions.ResolveDeficienciesSuccess.type,
    claimantActions.Error.type,
  ];

  constructor(
    public readonly modalService: ModalService,
    private readonly fb: FormBuilder,
    private readonly store: Store<ClaimantDetailsState>,
    private readonly dateFormatPipe: DateFormatPipe
  ){}

  ngOnInit(): void {
    this.currentDeficiencyDataType = DeficiencyDataTypeHelper.mapDeficiencyTypeToDataType(this.currentDeficiency.expectedResponseId);
    this.responseValuesForm = this.fb.group({
      textValue: this.fb.control(''),
      amountValue: this.fb.control(null),
      inputDates: []
    });

    this.setDefaultValues();

    this.store.dispatch(claimantActions.GetPendingDeficiencyResolutions({ clientId: this.currentDeficiency.clientId }));

    this.pendingDeficiency$.pipe(
      takeUntil(this.ngUnsubscribe),
      filter(pendingDeficiencies => !!pendingDeficiencies && pendingDeficiencies?.length > 0)
    ).subscribe(pendingDeficiencies => {
      this.loadPendingDeficiencyData(pendingDeficiencies);
    });
  }

  get currentDeficiency(): ClaimantDeficiency {
    return this.deficiencies[this.currentDeficiencyIndex];
  }

  get deficiencyResolvedCount(): number {
    return Object.keys(this.deficiencyResponses).length + (this.isResponseValid && !this.deficiencyResponses[this.currentDeficiency.id] ? 1 : 0);
  }

  private setDefaultValues(): void {
    if (this.currentDeficiencyDataType === DeficiencyExpectedDataType.Decimal) {
      this.responseValuesForm.patchValue({amountValue: '0'});
    }
  }

  private updateCurrentDeficiencyResponse(response: Partial<DeficiencyResponseDetail>): void {
    const currentDeficiencyId = this.currentDeficiency?.id;

    this.deficiencyResponses[currentDeficiencyId] = {
      deficiencyId: currentDeficiencyId,
      deficiencyTypeExpectedResponseId: this.currentDeficiency.expectedResponseId,
      responseValue: this.getKeyToUpdate(),
      responseNote: response.responseNote || ''};
  }

  private getKeyToUpdate(): string[] {
    switch (this.currentDeficiencyDataType) {
      case DeficiencyExpectedDataType.Text:
        return [this.responseValuesForm.controls.textValue.value];
      case DeficiencyExpectedDataType.Decimal:
        const amountValue = this.responseValuesForm.controls.amountValue.value;
        return [amountValue !== '0' ? amountValue : '']
      case DeficiencyExpectedDataType.Date:
        return (Array.isArray(this.inputDates) && this.inputDates.length > 0) ? this.inputDates.map(date => this.dateFormatPipe.transform(date) || '') : [''];
      default:
        return [''];
     }
  }

  get inputDates(): FormArray {
    const inputDatesArray = this.responseValuesForm.controls.inputDates as FormArray;
    return inputDatesArray?.value?.filter(c => c);
  }

  get currentDeficiencyResponse(): DeficiencyResponseDetail {
    return this.deficiencyResponses?.[this.currentDeficiency?.id]
    || { deficiencyId: null, deficiencyTypeExpectedResponseId: null, responseValue: [], responseNote: '' };
  }

  get isResponseValid(): boolean {
    switch (this.currentDeficiencyDataType) {
      case DeficiencyExpectedDataType.Text:
        return this.responseValuesForm.controls.textValue?.value?.length > 1 || this.inputNote.length > 1;
      case DeficiencyExpectedDataType.Decimal:
        return this.responseValuesForm.controls.amountValue?.value > 0 || this.inputNote.length > 1;
      case DeficiencyExpectedDataType.File:
        return this.currentDeficiencyFiles.length > 0 || this.inputNote.length > 1;
      case DeficiencyExpectedDataType.Date:
        return this.inputDatesValidity && ( this.inputDates?.length >= 1 || this.inputNote.length > 1);
      default:
        return false;
    }
  }

  protected onFilesSelected(files: File[]): void {
    this.deficiencyFiles[this.currentDeficiency.id] = files.map(file => ({
        file,
        fileName: this.ensurePrefixedFileName(file.name)
    }));

    this.currentDeficiencyFiles = this.deficiencyFiles[this.currentDeficiency.id]?.map(item => item.file);
  }

  private ensurePrefixedFileName(fileName: string): string {
      const prefix = `${this.currentDeficiency.id}_`;
      return fileName.startsWith(prefix) ? fileName : `${prefix}${fileName}`;
}

  public onNext(): void {
    if (this.isResponseValid) {
      this.updateCurrentDeficiencyResponse({ responseValue: this.responseValuesForm.value, responseNote: this.inputNote });
      this.goToNext();
    }
  }

  public onSkip(): void {
    if (!this.isResponseValid) {
      delete this.deficiencyResponses[this.currentDeficiency?.id];
    }
    this.goToNext();
  }

  public goToNext(): void {
    if (this.currentDeficiencyIndex < this.deficiencies.length - 1) {
      this.currentDeficiencyIndex++;
      this.currentDeficiencyDataType = DeficiencyDataTypeHelper.mapDeficiencyTypeToDataType(this.currentDeficiency.expectedResponseId);
      const response = this.deficiencyResponses[this.currentDeficiency.id];
      this.loadCurrentDeficiency(response);
    }
  }

  public onBack(): void {
    if (this.currentDeficiencyIndex > 0) {
      this.currentDeficiencyIndex--;
      this.currentDeficiencyDataType = DeficiencyDataTypeHelper.mapDeficiencyTypeToDataType(this.currentDeficiency.expectedResponseId);
      const response = this.deficiencyResponses[this.currentDeficiency.id];
      this.loadCurrentDeficiency(response);
    }
  }

  private loadCurrentDeficiency(response: DeficiencyResponseDetail): void {
    const defaultResponse = { responseValue: null, responseNote: '' };
    const current = this.deficiencyResponses[this.currentDeficiency.id] || defaultResponse;
    if (response) {
      response.responseValue = current.responseValue;
      response.responseNote = current.responseNote;
    }

    switch (this.currentDeficiencyDataType) {
      case DeficiencyExpectedDataType.Text:
        this.responseValuesForm.patchValue({ textValue: response?.responseValue?.[0] ?? '' });
        break;
      case DeficiencyExpectedDataType.Decimal:
        this.responseValuesForm.patchValue({ amountValue: response?.responseValue?.[0] ?? '0' });
        break;
      case DeficiencyExpectedDataType.File:
        this.filesSelector?.clearFileList();
        this.currentDeficiencyFiles = this.deficiencyFiles[this.currentDeficiency.id]?.map(item => item.file) || [];
        break;
      case DeficiencyExpectedDataType.Date:
        this.responseValuesForm.patchValue({ inputDates: (response?.responseValue || ['']).map(dateStr => dateStr ? new Date(dateStr) : '')});
        break;
      default:
        this.responseValuesForm.reset();
        break;
    }
    this.inputNote = response?.responseNote ?? '';
  }

  loadPendingDeficiencyData(pendingDeficiencies: IDeficiencyResolutionWithFiles[]){
    pendingDeficiencies.forEach(deficiency => {
      const response: DeficiencyResponseDetail = {
        deficiencyId: deficiency.deficiencyResolution.deficiencyId,
        deficiencyTypeExpectedResponseId: deficiency.deficiencyResolution.deficiencyResolutionDetails[0].deficiencyTypeExpectedResponseId,
        responseValue: deficiency.deficiencyResolution.deficiencyResolutionDetails.map(detail => detail.resolutionValue),
        responseNote: deficiency.deficiencyResolution.resolutionNote
      };
      this.deficiencyResponses[response.deficiencyId] = response;
    });
    pendingDeficiencies.forEach(deficiency => {
      const files = deficiency.files.map(f =>
        FileHelper.base64ToFile(f.base64Content, f.name || f.fileName, f.contentType || 'application/octet-stream')
      );
      this.deficiencyFiles[deficiency.deficiencyResolution.deficiencyId] = files.map(file => ({ file, fileName: `${deficiency.deficiencyResolution.deficiencyId}_${file.name}` }));
    });
    this.currentDeficiencyFiles = this.deficiencyFiles[this.currentDeficiency.id]?.map(item => item.file) || [];
    this.loadCurrentDeficiency(this.currentDeficiencyResponse);
    this.updateCurrentDeficiencyResponse({ responseValue: this.responseValuesForm.value, responseNote: this.inputNote });
  }

  public onSubmit(): void {
    if (this.isResponseValid) {
      this.updateCurrentDeficiencyResponse({ responseValue: this.responseValuesForm.value, responseNote: this.inputNote });
      const responses = this.prepareDeficiencyResponses();
      const files = Object.values(this.deficiencyFiles).reduce((acc, curr) => { return acc.concat(curr) }, []);
      this.store.dispatch(claimantActions.ResolveDeficiencies({ deficienciesResolution: responses, files: files }));
    }
  }

  private prepareDeficiencyResponses(): IDeficiencyResolution[] {
    return Object.values(this.deficiencyResponses).map(response => {
      const hasFiles = this.deficiencyFiles[response.deficiencyId]?.length > 0;

      return {
        deficiencyId: response.deficiencyId,
        clientId: this.clientId,
        resolutionNote: response.responseNote,
        deficiencyResolutionDetails: !hasFiles
          ? response.responseValue.map(value => ( value && { resolutionValue: value, deficiencyTypeExpectedResponseId: response.deficiencyTypeExpectedResponseId }))
          : [{ deficiencyTypeExpectedResponseId: response.deficiencyTypeExpectedResponseId }]
      }
    });
  }

  public onSubmitActionFinished(action: Action = null): void {
    if (action.type === claimantActions.ResolveDeficienciesSuccess.type) {
      this.modalService.hide();
      this.onSubmitFinished();
    }
  }

  public onSubmitValidityChanged(isSubmitValid: boolean): void {
    this.inputDatesValidity = isSubmitValid;
  }

  public downloadClaimantForm(): void {
    this.store.dispatch(clientListActions.DownloadClientsDocument({ id: this.currentDeficiency.documentsAttachedId }));
  }

  public onCancel(): void {
    this.modalService.hide();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  protected readonly DeficiencyTypeExpectedResponse = DeficiencyTypeExpectedResponse;
}
