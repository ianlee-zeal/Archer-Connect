import { FormulaSetFormulas } from "./formula-set-formulas";
import { FormulaSetMappings } from "./formula-set-mappings";
import { FormulaSetSettings } from "./formula-set-settings";
import { FormulaSetVariables } from "./formula-set-variables";

export class FormulaSets {
  id: number;
  name: string;
  targetScriptFilename: string;

  formulaSetMappings: FormulaSetMappings[];
  formulaSetFormulas: FormulaSetFormulas[];
  formulaSetSettings: FormulaSetSettings[];
  formulaSetVariables: FormulaSetVariables[];

  public static toModel(item: any): FormulaSets {
    if (item) {
      return {
        id: item.id,
        name: item.name,
        targetScriptFilename: item.targetScriptFilename,
        formulaSetMappings: item.formulaSetMappings,
        formulaSetFormulas: item.formulaSetFormulas,
        formulaSetSettings: item.formulaSetSettings,
        formulaSetVariables: item.formulaSetVariables,
      };
    }

    return null;
  }
}
