import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';

import { sharedSelectors } from '@app/modules/shared/state';
import { EntityTypeEnum, PermissionActionTypeEnum, PermissionTypeEnum } from '@app/models/enums';
import { ActionHandlersMap } from '@app/modules/shared/action-bar/action-handlers-map';
import { PermissionService } from '@app/services';
import { GridId } from '@app/models/enums/grid-id.enum';
import * as fromPersons from '../../state';

@Component({
  selector: 'app-person-address-tab',
  templateUrl: './person-address-tab.component.html',
  styleUrls: ['./person-address-tab.component.scss'],
})
export class PersonAddressTabComponent implements OnInit, OnDestroy {
  public readonly entityType = EntityTypeEnum.Persons;
  public readonly gridId = GridId.PersonAddresses;

  public person$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.person);
  public addressesListActionBar$ = this.store.select(sharedSelectors.addressesListSelectors.actionBar);

  private readonly actionBar: ActionHandlersMap = { back: () => this.cancel() };

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromPersons.PersonState>,
  ) { }

  public ngOnInit(): void {
    this.addressesListActionBar$.pipe(
      takeUntil(this.ngUnsubscribe$),
      first(actionBar => actionBar !== null),
    )
      .subscribe(actionBar => {
        this.store.dispatch(fromPersons.actions.UpdateActionBar({
          actionBar: {
            ...actionBar,
            ...this.actionBar,
            new: {
              ...actionBar.new,
              permissions: PermissionService.create(PermissionTypeEnum.PersonAddresses, PermissionActionTypeEnum.Create),
            },
          },
        }));
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private cancel(): void {
    this.store.dispatch(fromPersons.actions.GoBack());
  }
}
