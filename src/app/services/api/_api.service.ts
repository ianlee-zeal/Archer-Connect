import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { tap, map, concatMap, first } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import * as fromAuth from '@app/modules/auth/state';
import { FileHelper } from '@app/helpers/file.helper';
import moment from 'moment-timezone';
import { TimezoneNamesHelper } from '@app/helpers/timezone-names.helper';
import { FileService } from '../file.service';
import { environment } from '../../../environments/environment';
import { ToastService } from '../toast-service';
import { AppState } from '@app/state';
import { UserInfo } from '@app/models';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { FormDataHelper } from '@app/helpers/form-data.helper';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private endpoint = environment.api_url;

  private orgId: string;
  private timezone: string;
  private user: UserInfo

  private headers = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private authStore: Store<fromAuth.AppState>,
    private httpClient: HttpClient,
    private toaster: ToastService,
    private readonly store: Store<AppState>,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.authStore.select(fromAuth.authSelectors.getUser).subscribe(user => {
      if (user) {
        this.user = user;
        this.orgId = String(user.selectedOrganization?.id);

        this.headers.headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          orgId: this.orgId,
          timezone: this.setTimezone(user),
        });
      }
    });
  }

  private setTimezone(user): string {
    const localIanaName = moment.tz.guess();
    let localTimezone;
    try {
      localTimezone = TimezoneNamesHelper.getWindowsTimezoneByIanaName(localIanaName);
    }
    catch(e) {
      this.toaster.showError(`Your local timezone is not identified by ${localIanaName}.`);
    }

    this.timezone = (user.timezone && user.timezone.name) || localTimezone || '';
    return this.timezone;
  }

  get<T>(path: string, params?: HttpParams, context?: HttpContext) {
    return this.handleResponse(this.httpClient.get<T>(this.endpoint + path, { ...this.headers, params, context }));
  }

  post<T>(path, data: T, context?: HttpContext) {
    return this.handleResponse(this.httpClient.post<T>(this.endpoint + path, data, { ...this.headers, context }));
  }

  postWithResponse<T>(path: string, data: T) {
    const headerWithResponse = { ...this.headers, observe: "response" as 'response' };
    return this.handleResponse(this.httpClient.post<T>(this.endpoint + path, data, headerWithResponse));
  }

  postWithoutHttpClient<T>(path: string, data: T): Promise<Response> {
    const url = this.endpoint + path;

    let tokenValue: string;
    const headers = new Headers();
    return new Promise((resolve: (value: Response | PromiseLike<Response>) => void) => {
      this.oidcSecurityService.getAccessToken().pipe(
        first((token: string) => !!token),
      ).subscribe((token: string) => {
        const currentToken = token;
        if (currentToken !== '') {
          tokenValue = `Bearer ${currentToken}`;
        }

        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('orgId', this.orgId);
        headers.append('timezone', this.setTimezone(this.user));
        headers.append('Authorization', tokenValue);

        resolve(fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        }));
      });
    });
  }

  getFile(path: string, fileName?: string): Observable<File> {
    const headers = this.headers.headers.delete('Content-Type').delete('Accept');

    return this.handleResponse(
      this.httpClient.request('GET', this.endpoint + path, {
        headers,
        responseType: 'arraybuffer',
        observe: 'response',
      }).pipe(map(response => {
        this.saveResponseAsFile(response, fileName);
      })),
    );
  }

  getBlob(path: string): Observable<Blob> {
    const headers = this.headers.headers.delete('Content-Type').delete('Accept');

    return this.handleResponse(
      this.httpClient.request('GET', this.endpoint + path, {
        headers,
        responseType: 'arraybuffer',
        observe: 'response',
      }).pipe(
        map((response: HttpResponse<ArrayBuffer>) => {
          const blob = new Blob([response.body], { type: response.headers.get('Content-Type') || 'application/octet-stream' });

          return blob;
        }),
      ),
    );
  }

  openFile(path): Observable<File> {
    const headers = this.headers.headers.delete('Content-Type').delete('Accept');
    return this.handleResponse(
      this.httpClient.request('GET', this.endpoint + path, {
        headers,
        responseType: 'arraybuffer',
        observe: 'response',
      }).pipe(map(response => {
        const file = new Blob([response.body], { type: 'text/plain' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      })),
    );
  }

  exportSearch<T>(path, searchOptions: T): Observable<File> {
    const headers = this.headers.headers.delete('Content-Type').delete('Accept');

    return this.handleResponse(
      this.httpClient.request('POST', this.endpoint + path, {
        body: searchOptions,
        headers,
        responseType: 'arraybuffer',
        observe: 'response',
      }).pipe(map(response => {
        this.saveResponseAsFile(response);
      })),
    );
  }

  private saveResponseAsFile(response: HttpResponse<ArrayBuffer>, filename?: string): void {
    const contentType = response.headers.get('Content-Type');
    if (!filename) {
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenamePart = contentDisposition.split('; ').find(name => name.includes('filename='));
      filename = filenamePart.split('=').pop().replace(/"/g, '');
    }

    saveAs(new File([response.body], filename, { type: contentType }));
  }

  postWithFile(path, data: any, file: File, isUpdate: boolean = false) {
    return this.postDataWithFile(path, data, file, isUpdate);
  }

  put<T>(path, data: T) {
    return this.handleResponse(this.httpClient.put<T>(this.endpoint + path, data, this.headers));
  }

  patch<T>(path, data: T) {
    return this.handleResponse(this.httpClient.patch<T>(this.endpoint + path, data, this.headers));
  }

  delete<T>(path, data = null) {
    return this.handleResponse(this.httpClient.request<T>('DELETE', this.endpoint + path, { ...this.headers, body: data }));
  }

  putWithFile(path: string, data: any, file: File) {
    return this.postDataWithFile(path, data, file, true);
  }

  handleResponse(call) {
    return call.pipe(
      tap(
        () => { }, // console.log('api service:', data) },
      ),
    );
  }

  private postDataWithFile<T>(path, postData: any, file?: File, isUpdate: boolean = false) {
    if (!file) {
      return this.handleResponse(
        !isUpdate ? this.httpClient.post<T>(this.endpoint + path, postData, this.headers) : this.httpClient.put<T>(this.endpoint + path, postData, this.headers),
      );
    }

    const data = { ...postData };
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);

    data.fileName = FileHelper.extractFileName(fileName, extension);
    data.mimeType = { extension };

    return FileService.fileToByteArray(file).pipe(
      concatMap(byteArray => {
        data.fileContent = Array.from(byteArray);

        return this.handleResponse(
          !isUpdate ? this.httpClient.post<T>(this.endpoint + path, data, this.headers) : this.httpClient.put<T>(this.endpoint + path, data, this.headers),
        );
      }),
    );
  }

  public postWithFileFormData(path, postData: any, file: File, isUpdate: boolean = false) {

    const data = { ...postData };
    delete data.fileContent;
    const fileName = file.name;
    const extension = FileHelper.getExtension(fileName);

    data.fileName = FileHelper.truncateFileName(FileHelper.extractFileName(fileName, extension), FileHelper.maxFileNameLength);
    data.mimeType = { extension };

    const formData = FormDataHelper.objectToFormData(data) as FormData;
    formData.append('files', file, fileName);

    return this.handleResponse(
      !isUpdate ? this.postFormData(path, formData) : this.putFormData(path, formData),
    );
  }

  postFormData(path: string, formData: FormData) {
    const headers = {
      headers: new HttpHeaders({
        enctype: 'multipart/form-data',
        orgId: this.orgId,
        timezone: this.timezone,
      }),
    };
    return this.httpClient.post(`${this.endpoint}${path}`, formData, headers);
  }

  postFormDataWithProgress(path: string, formData: FormData, context?: HttpContext) {
    const headers = new HttpHeaders({
      enctype: 'multipart/form-data',
      orgId: this.orgId,
      timezone: this.timezone,
    });
    const req = new HttpRequest('POST', `${this.endpoint}${path}`, formData, {
      headers,
      reportProgress: true,
      context,
    });
    return this.httpClient.request(req);
  }

  putFormData(path: string, formData: FormData) {
    const headers = {
      headers: new HttpHeaders({
        enctype: 'multipart/form-data',
        orgId: this.orgId,
        timezone: this.timezone,
      }),
    };
    return this.httpClient.put(`${this.endpoint}${path}`, formData, headers);
  }
}
