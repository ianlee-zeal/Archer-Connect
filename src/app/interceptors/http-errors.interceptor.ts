import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { environment } from 'src/environments/environment';
import { CommonHelper } from '@app/helpers';
import * as fromAuth from '../modules/auth/state';
import * as fromRoot from '../state';
import * as authActions from '../modules/auth/state/auth.actions';
import * as rootActions from '../state/root.actions';
import { CustomUrlEncoder } from '../encoders/custom-url.encoder';
import { HttpError } from './http-error';

@Injectable()
export class HttpErrorsInterceptor implements HttpInterceptor {
  constructor(
    private authStore: Store<fromAuth.AppState>,
    private rootStore: Store<fromRoot.AppState>,
    private router: Router,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const params = new HttpParams({
      encoder: new CustomUrlEncoder(),
      fromString: request.params.toString(),
    });

    return next.handle(request.clone({ params }))
      .pipe(
        catchError((e: HttpErrorResponse) => {
          CommonHelper.windowLog('HttpErrorsInterceptor, e', e);

          const error = this.geInnerException(e);
          CommonHelper.windowLog('HttpErrorsInterceptor, innerException', error);

          const message = this.getMessage(error);
          CommonHelper.windowLog('HttpErrorsInterceptor, message', message);

          switch (e.status) {
            case HttpError.NoConnection:
              this.rootStore.dispatch(rootActions.Error({ error: 'No connection with the server' }));
              break;

            case HttpError.TimeOut:
            case HttpError.Unauthorized:
              this.authStore.dispatch(authActions.AuthLogout('Your session has timed out. Please login again'));
              break;

            case HttpError.BadRequest: {
              this.rootStore.dispatch(rootActions.ResetLoading());
              const errorMessages = this.getExceptionDetails(e);
              if (errorMessages) {
                return throwError({ error: message, errorMessages });
              }

              return error.errors
                ? throwError('Validation error')
                : throwError(message);
            }

            case HttpError.UnprocessableEntity: {
              this.rootStore.dispatch(rootActions.ResetLoading());
              const errorMessages = this.getExceptionDetails(e);
              if (errorMessages) {
                return throwError({ error: message, errorMessages, noToaster: true });
              }

              return error.errors
                ? throwError({ error: 'Validation error', noToaster: true })
                : throwError({ error: message, noToaster: true });
            }

            case HttpError.NotFound:
              this.router.navigate(['not-found']);
              break;

            case HttpError.Forbidden:
              this.rootStore.dispatch(rootActions.ResetLoading());
              this.router.navigate(['no-access']);
              break;

            case HttpError.InternalServerError:
            default:
              if (environment.production) {
                this.rootStore.dispatch(rootActions.Error({ title: 'Something went wrong', error: 'Please try again later' }));
                return Promise.resolve(null);
              }

              if (error instanceof ErrorEvent === false) {
                // Handle server errors
                this.rootStore.dispatch(rootActions.Error({ error: message }));
              } else {
                return throwError(message);
              }

              break;
          }

          // Effects will be able to catch an error with the message for code: 400 and UI errors.
          // throwError(null) - allow reducers to take actions on errors
          // Promise.resolve(null) - mute errors
          return throwError(null);
        }),
      );
  }

  geInnerException(e) {
    return e.error
      ? this.geInnerException(e.error)
      : e;
  }

  getMessage(error): string {
    let message: string = '';

    if (typeof error === 'string') {
      message = error;
    } else if (error.ExceptionMessage) {
      message = error.ExceptionMessage;
    } else {
      message = error.message;
    }

    return message;
  }

  getExceptionDetails(error: HttpErrorResponse): any {
    const { error: { errorMessages } } = error;

    if (errorMessages) {
      if (Object.keys(errorMessages).length === 0) {
        return null;
      }
      return errorMessages;
    }

    return null;
  }
}
