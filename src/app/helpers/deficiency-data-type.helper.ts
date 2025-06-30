import { DeficiencyExpectedDataType } from "@app/models/enums/claimant-deficiencies/deficiency-expected-data-type.enum";
import { DeficiencyTypeExpectedResponse } from "@app/models/enums/claimant-deficiencies/deficiency-type-expected-response.enum";

export class DeficiencyDataTypeHelper {

  public static  mapDeficiencyTypeToDataType(deficiencyTypeId: number): DeficiencyExpectedDataType {
      const deficiencyToDataTypeMap: Record<number, DeficiencyExpectedDataType> = {
        [DeficiencyTypeExpectedResponse.Description]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.Date]: DeficiencyExpectedDataType.Date,
        [DeficiencyTypeExpectedResponse.SSN]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.Address]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.Amount]: DeficiencyExpectedDataType.Decimal,
        [DeficiencyTypeExpectedResponse.InsurancePlan]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.TreatmentFacility]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.CityState]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.BranchOfMilitary]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.OtherGovernmental]: DeficiencyExpectedDataType.Text,
        [DeficiencyTypeExpectedResponse.Document]: DeficiencyExpectedDataType.File,
        [DeficiencyTypeExpectedResponse.DocumentReview]: DeficiencyExpectedDataType.File,
        [DeficiencyTypeExpectedResponse.Response]: DeficiencyExpectedDataType.Text,
      };

      return deficiencyToDataTypeMap[deficiencyTypeId] || null;
    }
}