import { Settlement } from '@app/models/settlement';
import { ActionHandlersMap } from '../../action-bar/action-handlers-map';

export interface SharedSettlementInfoState {
  settlement: Settlement;
  settlementInfoHeader: Settlement;
  isSettlementValid: boolean,
  prevSettlementId: number;
  actionBar: ActionHandlersMap;
  error: string;
  showFinancialSummary: boolean;
}

export const initialState: SharedSettlementInfoState = {
  settlement: null,
  settlementInfoHeader: null,
  isSettlementValid: false,
  prevSettlementId: null,
  actionBar: null,
  error: null,
  showFinancialSummary: false,
};
