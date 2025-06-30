import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class ModalService {
  private modalConfig: ModalOptions;

  constructor(private bsModalService: BsModalService) {
    this.modalConfig = { backdrop: 'static' };
  }

  get onHidden(): EventEmitter<any> {
    return this.bsModalService.onHidden;
  }

  show(content: any, config?: ModalOptions): BsModalRef {
    return this.bsModalService.show(content, { ...this.config, ...config });
  }

  hide(): void {
    this.bsModalService.hide();
  }

  get config(): ModalOptions {
    return { ...this.modalConfig } as ModalOptions;
  }
}
