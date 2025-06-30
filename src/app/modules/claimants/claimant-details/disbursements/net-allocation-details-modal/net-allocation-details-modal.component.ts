import { Component } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { Store } from "@ngrx/store";

import { ClaimantDetailsState } from "../../state/reducer";
import * as selectors from '../../state/selectors';

@Component({
  selector: "app-net-allocation-details-modal",
  templateUrl: "./net-allocation-details-modal.component.html",
  styleUrls: ["./net-allocation-details-modal.component.scss"],
})
export class NetAllocationDetailsModalComponent {

  public netAllocationDetails$ = this.store.select(selectors.netAllocationDetails)

  constructor(
    private modal: BsModalRef,
    private store: Store<ClaimantDetailsState>
  ) {}

  public onClose(): void {
    this.modal.hide();
  }
}
