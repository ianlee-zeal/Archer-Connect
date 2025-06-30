import { SelectOption } from "@app/modules/shared/_abstractions/base-select";

export class ClosingStatementInformation {
  isClosingStatementReady: boolean;
  validOutputTypes: number[];
  defaultClosingStatementId: number | null;
  closingStatements: SelectOption[] = [];
  entityValidationErrors: string[] = [];

  public static toModel(item: any): ClosingStatementInformation {
    if (item) {
      return {
        isClosingStatementReady: item.isClosingStatementReady,
        validOutputTypes: item.validOutputTypes,
        defaultClosingStatementId: item.defaultClosingStatementId,
        closingStatements: item.closingStatements,
        entityValidationErrors: item.entityValidationErrors,
      };
    }

    return null;
  }
}
