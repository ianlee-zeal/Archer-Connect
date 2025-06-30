import { IdValue, LienPhase } from '@app/models';
import { DashboardFilters } from '@app/models/enums/dashboard-filters.enum';
import { ReleaseInGoodOrder } from '@app/models/liens/release-in-good-order';
import { KeyValuePair } from '@app/models/utils';

export class DashboardFiltersHelper {
  public static changeFilter(newFilter: KeyValuePair<string, string>, filters: KeyValuePair<string, string>[]) {
    const index = filters.findIndex(filter => filter.key === newFilter.key);

    if (index !== -1) {
      if (filters[index].value === newFilter.value || !newFilter.value) {
        filters.splice(index, 1);
      } else {
        filters[index] = newFilter;
      }
    } else {
      filters.push(newFilter);
    }

    return filters;
  }

  public static updateDashboardActionFilters<T>(selectedPhases: number[], selectedStages: T[], selectedTypes: number[], allPhases: LienPhase[], allStages: IdValue[], allTypes: IdValue[], isReleaseInGoodOrder?:boolean, allReleaseInGoodOrderTypes?: ReleaseInGoodOrder[]): KeyValuePair<string, string>[] {

    let allFilters: KeyValuePair<string, string>[] = [];

    if (selectedPhases?.length > 0 && allPhases?.length > 0) {
      selectedPhases.forEach(phaseId => {
        let phase:LienPhase = allPhases.find(i => i.id === phaseId);
        const newFilter = { key: DashboardFilters.Phase, value: phase.name };
        allFilters.push(newFilter)
      });
    }


    if (selectedStages?.length > 0 && allStages?.length > 0) {
      selectedStages.forEach(stageId => {
        let stage:IdValue = allStages.find(i => i.id.toString().trim() == stageId.toString().trim());
        const newFilter = { key: DashboardFilters.Status, value: stage.name };
        allFilters.push(newFilter)
      });
    }

    if (selectedTypes?.length > 0 && allTypes?.length > 0) {
      selectedTypes.forEach(typeId => {
        let type:IdValue = allTypes.find(i => i.id === typeId);
        const newFilter = { key: DashboardFilters.Product, value: type.name };
        allFilters.push(newFilter)
      });
    }

    if(isReleaseInGoodOrder != null && allReleaseInGoodOrderTypes?.length > 0){
      let releaseInGoodOrder:ReleaseInGoodOrder = allReleaseInGoodOrderTypes.find(i => i.isReleaseInGoodOrder === isReleaseInGoodOrder);
      const newFilter = { key: DashboardFilters.ReleaseInGoodOrder, value: releaseInGoodOrder.name };
        allFilters.push(newFilter)
    }

    return allFilters;
  }
}
