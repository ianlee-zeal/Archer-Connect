/* eslint-disable no-param-reassign */
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private readonly toastr: ToastrService) {
    toastr.toastrConfig.closeButton = true;
    toastr.toastrConfig.newestOnTop = true;
    toastr.toastrConfig.progressBar = true;
    toastr.toastrConfig.maxOpened = 10;
    toastr.toastrConfig.timeOut = 5000;
  }

  showInfo(message: string, title: string = 'Info') {
    this.toastr.info(message, title);
  }

  showSuccess(message: string, title: string = 'Success') {
    this.toastr.success(message, title, {
      closeButton: false,
      progressBar: false,
      timeOut: 3000,
    });
  }

  showWarning(message: string, title: string = 'Warning') {
    this.toastr.warning(message, title);
  }

  showError(message: string, title: string = 'Error') {
    this.toastr.clear();

    this.toastr.error(message, title, {
      timeOut: 7000,
      tapToDismiss: false,
    });
  }

  showSuccessMessage(message: string, title: string = '') {
    this.toastr.show(message, title, {
      positionClass: 'toast-top-right',
      toastClass: 'ngx-toastr custom-toast',
      progressBar: false,
      extendedTimeOut: 1000,
      enableHtml: true,
      tapToDismiss: true,
    });

    const customToastStyle = document.createElement('style');
    customToastStyle.innerHTML = `
      .custom-toast {
        background-color: #050041 !important;
        width: 400px !important;
        height: 55px !important;
        margin-top: 100px !important;
        margin-right: 20px !important;
        border-radius: 8px !important;
        padding-left: 25px !important;
      }
      .custom-toast .toast-close-button {
        margin-right: 15px !important;
      }
    `;
    document.head.appendChild(customToastStyle);
  }
}
