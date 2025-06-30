import { GridApi } from "ag-grid-community";
import { CurrencyHelper } from "./currency.helper";

export class SumHelper {
    public static calculateTotalPayment(gridApi: GridApi): string {
        const rowData: any[] = [];
        gridApi.forEachNode(node => rowData.push(node.data));

        const total = rowData.reduce((sum, row) => sum + (row?.fields?.Amount || 0), 0);
        return CurrencyHelper.toUsdFormat({ value: total });
    }
}