import { Component } from '@angular/core';
import { IconHelper } from '@app/helpers/icon-helper';
import { FileHelper } from '@app/helpers/file.helper';

import { BaseCellRendererComponent } from '../../_abstractions/base-cell-renderer';

@Component({
  selector: 'app-document-type-cell-renderer',
  templateUrl: './document-type-cell-renderer.component.html',
  styleUrls: ['./document-type-cell-renderer.component.scss'],
})
export class DocumentTypeCellRendererComponent extends BaseCellRendererComponent {
  public type: string;
  public imageSrc: string;

  public agInit(params: any): void {
    super.agInit(params);

    if (!this.params.data) return;

    const { documentType, mimeType, fileContent } = this.params.document || this.params.data;

    const extension: string = mimeType ? mimeType.extension : FileHelper.getExtension(fileContent?.name);

    const additionalLabel = documentType.isActive ? '' : ' (inactive)';

    this.type = (documentType && documentType.name) + additionalLabel;

    this.imageSrc = extension ? (IconHelper.getMimeIconByExtension(extension)) : null;
  }
}
