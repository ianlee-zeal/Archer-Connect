import { MedicalLiensListState } from '../medical-liens-list/state/reducer';

export const FEATURE_NAME = 'medical_liens_feature';
export interface MedicalLiensState {
  medicalLiensList: MedicalLiensListState,
}
