import { FilterModelOperation } from './filter-model-operation.enum';

export class FilterModel {
  conditions?: FilterModel[] = [];
  operation?: FilterModelOperation = null;
  filter: string | number | boolean | number[] = null;
  key: string;
  filterTo: string | number | boolean = null;
  dateFrom: string = null;
  dateTo: string = null;
  filterType: string = null;
  type: string = null;

  constructor(model?: Partial<FilterModel>) {
    this.conditions = model?.conditions ?? [];
    this.operation = model?.operation ?? null;
    this.filter = model?.filter ?? null;
    this.key = model?.key;
    this.filterTo = model?.filterTo ?? null;
    this.dateFrom = model?.dateFrom ?? null;
    this.dateTo = model?.dateTo ?? null;
    this.filterType = model?.filterType ?? null;
    this.type = model?.type ?? null;
  }
}
