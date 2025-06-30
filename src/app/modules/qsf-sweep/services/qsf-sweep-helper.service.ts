import { EventEmitter, Injectable } from '@angular/core';
import { AppState } from '@shared/state';
import { Store } from '@ngrx/store';
import * as actions from '@app/modules/qsf-sweep/state/actions';
import { QSFSweepBatchPusher } from '@app/models/qsf-sweep/qsf-sweep-batch-pusher';
import { QSFLienSweepStatus } from '@app/models/enums/qsf-lien-sweep-status.enum';

@Injectable({ providedIn: 'root' })
export class QsfSweepHelperService {
  private readonly currentBatch: EventEmitter<QSFSweepBatchPusher> = new EventEmitter<QSFSweepBatchPusher>();

  constructor(
    private readonly store: Store<AppState>,
  ) {

  }

  public runQsfSweepEventHandler = (data: QSFSweepBatchPusher, event: string): void => {
    switch (QSFLienSweepStatus[event]) {
      case QSFLienSweepStatus.Success:
        this.store.dispatch(actions.SetQsfSweepStatus({ isQsfSweepInProgress: false }));
        break;
      case QSFLienSweepStatus.Error:
        this.store.dispatch(actions.Error({ errorMessage: `Error QSF Sweep: ${data.Message}` }));
        this.store.dispatch(actions.SetQsfSweepStatus({ isQsfSweepInProgress: false }));
        break;
      default:
        break;
    }
    this.currentBatch.emit(data);
  };

  public getCurrentBatchEmitter(): EventEmitter<QSFSweepBatchPusher> {
    return this.currentBatch;
  }
}
