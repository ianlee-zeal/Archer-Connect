/* eslint-disable no-restricted-globals */
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

import { Person, PaginatorParams } from '@app/models';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { DateFormatPipe } from '@shared/_pipes/date-format.pipe';
import { NavigationSettings } from '@app/modules/shared/action-bar/navigation-settings';
import { PersonsService } from '@app/services';
import { sharedActions, sharedSelectors } from '@app/modules/shared/state';

import { commonSelectors } from '@shared/state/common.selectors';
import * as fromShared from '@shared/state/common.actions';
import * as paginatorActions from '@shared/grid-pager/state/actions';
import * as personsSharedActions from '@shared/state/person-general-info/actions';
import * as rootSelectors from '@app/state';
import * as fromPersons from '../state';
import { IServerSideGetRowsRequestExtended } from '@app/modules/shared/_interfaces/ag-grid/ss-get-rows-request';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.scss'],
})
export class PersonDetailsComponent implements OnInit, OnDestroy {
  @Input() public id: number;

  public actionBar$ = this.store.select(fromPersons.selectors.actionBar);
  public gridParams$ = this.store.select(fromPersons.selectors.agGridParams);
  readonly pager$ = this.store.select(commonSelectors.pager);

  public person: Person;
  public title: string;
  public headerElements: ContextBarElement[];
  public navigationSettings: NavigationSettings;
  private gridParams: IServerSideGetRowsRequestExtended;

  public personDetailsHeader$ = this.store.select(sharedSelectors.personGeneralInfoSelectors.personDetailsHeader);
  public allPersons$ = this.store.select(fromPersons.selectors.persons);
  public loadingInProgress$ = this.store.select(rootSelectors.loadingInProgress);

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<fromPersons.PersonState>,
    private dateFormat: DateFormatPipe,
    private activatedRoute: ActivatedRoute,
    private personsService: PersonsService,
  ) { }

  public ngOnInit(): void {
    this.id = +this.activatedRoute.snapshot.params.id;

    if (!this.id) {
      return;
    }

    this.fillContextBarData();

    this.store.dispatch(sharedActions.personGeneralInfoActions.GetPersonDetails({ id: this.id }));
    this.store.dispatch(fromPersons.actions.UpdatePreviousPersonId({ prevPersonId: history.state.prevPersonId }));
    this.store.dispatch(fromPersons.actions.UpdatePreviousPersonUrl({ personPreviousUrl: history.state.personPreviousUrl }));

    this.gridParams$
      .pipe(
        filter(p => p !== null),
        takeUntil(this.ngUnsubscribe$),
      )
      .subscribe(params => {
        this.gridParams = params.request;
      });

    this.startPersonLoading();
  }

  private fillContextBarData(): void {
    this.personDetailsHeader$.pipe(
      filter(person => person != null),
      takeUntil(this.ngUnsubscribe$),
    ).subscribe(person => {
      this.title = person.fullName;
      this.headerElements = [
        { column: 'Id', valueGetter: () => person.id },
        { column: 'DOB', valueGetter: () => this.dateFormat.transform(person.dateOfBirth) },
      ];
    });
  }

  public toPage(pageNumber: number): void {
    this.store.dispatch(fromShared.UpdatePager({ pager: { currentPage: pageNumber } }));
    this.store.dispatch(paginatorActions.Paginator({
      pageNumber,
      prevId: this.activatedRoute.snapshot.params.id,
      apiCall: this.personsService.search.bind(this.personsService),
      callback: this.paginatorCallBack.bind(this),
      params: <PaginatorParams>{ gridParams: this.gridParams },
    }));

    this.startPersonLoading();
  }

  private paginatorCallBack(id: number) {
    this.store.dispatch(personsSharedActions.GetPersonDetails({ id }));
  }

  private startPersonLoading() {
    this.store.dispatch(personsSharedActions.GetPersonLoadingStarted());
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
