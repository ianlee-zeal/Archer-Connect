import { Injectable, ErrorHandler, Injector, Inject } from '@angular/core';
import { ToastService } from '@app/services';
import { CommonHelper } from '@app/helpers';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  constructor(@Inject(Injector) private readonly injector: Injector) {
    super();
  }

  private get toastService(): ToastService {
    return this.injector.get(ToastService);
  }

  handleError(error: Error) {
    CommonHelper.windowLog("GlobalErrorHandler: " + error);

    // Handled UI exception
    //this.toastService.showError(error.message);

    super.handleError(error);
  }
}