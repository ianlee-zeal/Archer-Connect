import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';
import * as selectors from '../../state';
import * as actions from '../../state/root.actions';
import { RootState } from '../../state/root.state';
import * as fromAuth from '@app/modules/auth/state';

/**
 * Banner for notifications
 *
 * @export
 * @class BannerComponent
 */

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  public msg: string;
  public isBannerClosed: boolean = false;

  private readonly banner$ = this.store.select(selectors.selectBanner);
  private readonly ngUnsubscribe$ = new Subject<void>();

  private readonly user$ = this.store.select(fromAuth.authSelectors.getUser);

  constructor(private readonly store: Store<RootState>) {}

  public ngOnInit(): void {
    this.user$
      .pipe(
        filter(user => !!user && !!user.selectedOrganization),
        first(),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(() => {
        this.store.dispatch(actions.GetUserBanner());
      });
    this.banner$
      .pipe(
        filter((c: string) => !!c),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe((banner: string) => {
        this.msg = banner;
      });
  }

  clearBanner(): void {
    this.store.dispatch(actions.ClearBanner());
  }
}
