import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { PersonDuplicateList } from '@app/models/person-duplicate-list';
import { ModalService } from '@app/services';
import { ContactsLinkExistingComponent } from '../contacts-link-existing/contacts-link-existing.component';

@Component({
  selector: 'app-contacts-duplicate-warn',
  templateUrl: './contacts-duplicate-warn.component.html',
})
export class ContactsDuplicateWarnComponent implements OnInit {
  title: string;
  claimantId: number;
  duplicateList: PersonDuplicateList[];
  modal: BsModalRef;

  isFoundDuplicatedSsn: boolean = false;

  constructor(
    public duplicateWarnModal: BsModalRef,
    private modalService: ModalService,
  ) {}

  public ngOnInit(): void {
    this.isFoundDuplicatedSsn = this.duplicateList.some(d => d.hasProperty('ssn'));
  }

  onLink(): void {
    this.duplicateWarnModal.hide();

    const initialState = {
      title: 'Link Existing',
      personsIds: this.getAllDuplicateIds(),
      claimantId: this.claimantId,
      modal: this.modal,
    };

    this.modalService.show(ContactsLinkExistingComponent, {
      initialState,
      class: 'link-modal',
    });
  }

  onCreateNew(): void {
    this.modal.content.setSkipDuplicateChecking();
    this.modal.content.onSave();
    this.duplicateWarnModal.hide();
    this.modal.content.addNewContactModal.hide();
  }

  generateWarnMsg(item: PersonDuplicateList): string {
    let formattedPropertyName:string = '';

    const propsLength = item.properties.length;
    const duplicateIdsLength = item.duplicatePersonIds.length;

    item.properties.forEach((propName, index) => {
      // property name and divider logic
      const isCommaDivider = propsLength - 1 !== index && propsLength > 2 && propsLength - 2 !== index;
      const isAndDivider = propsLength - 1 !== index && (propsLength === 2 || (propsLength > 2 && propsLength - 2 === index));

      formattedPropertyName += `<span class="fw-bold">${propName}</span>${isCommaDivider ? ', ' : ''}
        ${isAndDivider ? ' and ' : ''}`;
    });

    return ` <span class="fw-bold">${duplicateIdsLength}</span>
    ${duplicateIdsLength > 1 ? 'people' : 'person'} with duplicate ${formattedPropertyName} already exists.`;
  }

  private getAllDuplicateIds(): number[] {
    let result: number[] = [];

    this.duplicateList.forEach(item => {
      result = [].concat(item.duplicatePersonIds, result);
    });

    return result;
  }
}
