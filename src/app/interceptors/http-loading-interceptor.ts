import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingIndicatorService } from '@app/services/loading-indicator.service';
import { BYPASS_SPINNER } from '@app/tokens/http-context-tokens';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  private totalRequests: number = 0;

  constructor(public service: LoadingIndicatorService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const skipSpinner = !request.context.get(BYPASS_SPINNER);
    if (skipSpinner) {
      this.totalRequests++;
      this.service.show();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (skipSpinner) {
          this.totalRequests--;
        }
        if (this.totalRequests === 0) {
          this.service.hide();
        }
      }),
    );
  }
}
