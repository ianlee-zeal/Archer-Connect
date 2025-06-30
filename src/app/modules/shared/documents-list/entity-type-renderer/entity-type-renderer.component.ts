import { Component } from '@angular/core';
import { DocumentLink } from '@app/models/documents';
import { BaseCellRendererComponent } from '../../_abstractions/base-cell-renderer';

@Component({
  selector: 'app-entity-type-renderer-component',
  templateUrl: './entity-type-renderer.component.html',
  styleUrls: ['./entity-type-renderer.component.scss'],
})
export class EntityTypeRendererComponent extends BaseCellRendererComponent {
  public documentLinks: DocumentLink[];
  public agInit(params: any): void {
    super.agInit(params);
    if (!this.params.data) return;

    const { documentLinks } = this.params.data;
    this.documentLinks = documentLinks?.filter((docLink: DocumentLink, index: number, self: DocumentLink[]) => self.findIndex(link => link.entityType.id === docLink.entityType.id) === index);
  }
}
