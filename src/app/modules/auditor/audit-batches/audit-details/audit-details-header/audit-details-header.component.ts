import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { DateFormatPipe } from '@app/modules/shared/_pipes';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import * as fromAuth from '@app/modules/auth/state';
import { AppState } from '@app/modules/shared/state';
import * as selectors from '../state/selectors';

@Component({
  selector: 'app-audit-details-header',
  templateUrl: './audit-details-header.component.html',
  styleUrls: ['./audit-details-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuditDetailsHeaderComponent implements OnInit, OnDestroy {
  private timezone: string;
  private readonly authStore$ = this.store.select(fromAuth.authSelectors.getUser);
  readonly auditDetailsHeader$ = this.store.select(selectors.auditDetailsHeader);

  private readonly ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private readonly datePipe: DateFormatPipe,
  ) {}

  ngOnInit() {
    this.authStore$.pipe(
      filter(user => !!user),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(user => {
      this.timezone = user.timezone && user.timezone.name;
    });
  }

  dateTransform(date) : string {
    return this.datePipe.transform(date, false, null, this.timezone);
  }

  getCount(count?: number) : string {
    let result = '';

    if (count === 0) {
      result = '0';
    } else if (count !== null) {
      result = count.toString();
    }
    return result;
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
