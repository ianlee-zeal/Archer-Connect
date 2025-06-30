import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

import { ValidationForm } from "./validation-form";

export abstract class BaseUploadBulkDocument extends ValidationForm
  implements OnDestroy {


  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  constructor() {
    super();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  protected abstract updateState(): void;
}
