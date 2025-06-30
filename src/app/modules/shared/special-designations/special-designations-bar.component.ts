import { Component, OnDestroy, OnInit } from '@angular/core';
import { LienService, Person } from '@app/models';
import { ActionsSubject, Store } from '@ngrx/store';

import { combineLatest, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ClaimantDetailsState } from 'src/app/modules/claimants/claimant-details/state/reducer';
import * as fromClaimants from 'src/app/modules/claimants/claimant-details/state/selectors';
import { ofType } from '@ngrx/effects';
import { Claimant } from '@app/models/claimant';
import { SpecialDesignationConfig } from '@app/models/claimant-special-designation';
import { personGeneralInfoSelectors as selectors } from '../state/person-general-info/selectors';
import { SaveUpdatedPersonComplete } from '../state/person-general-info/actions';

@Component({
  selector: 'app-special-designations-bar',
  templateUrl: './special-designations-bar.component.html',
  styleUrls: ['./special-designations-bar.component.scss'],
})
export class SpecialDesignationsBarComponent implements OnInit, OnDestroy {
  private person: Person;
  private services = [];

  public get items(): SpecialDesignationConfig[] {
    return this.specialDesignationsList.filter((item: SpecialDesignationConfig) => this.person?.[item.name]
      || this.services?.find((service: any) => service.name === item.label && service.count));
  }

  private specialDesignationsList: SpecialDesignationConfig[] = [
    { name: 'bankruptcy', icon: 'assets/images/Bankruptcy.svg', label: 'Bankruptcy' },
    { name: 'probate', icon: 'assets/images/Probate.svg', label: 'Probate' },
    { name: 'minor', icon: 'assets/images/Minor.svg', label: 'Minor' },
    { name: 'spanishSpeakerOnly', icon: 'assets/images/Spanish Speaker Only.svg', label: 'Spanish speaker only' },
    { name: 'incapacitatedAdult', icon: 'assets/images/Incapacitated Adult.svg', label: 'Incapacitated Adult' },
    { name: 'deceased', icon: 'assets/images/Deceased.svg', label: 'Deceased' },
  ];

  public person$ = this.store.select(selectors.person);
  private item$ = this.store.select(fromClaimants.item);
  private services$ = this.store.select(fromClaimants.services);
  public designatedNotes$ = this.store.select(fromClaimants.designatedNotes);
  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private store: Store<ClaimantDetailsState>,
    private actionsSubj: ActionsSubject,
  ) {}

  ngOnInit(): void {
    combineLatest([this.item$, this.person$, this.services$])
      .pipe(
        filter((item: [Claimant, Person, LienService[]]) => !!item),
        takeUntil(this.ngUnsubscribe$),
      ).subscribe(([claimant, person, services]: [Claimant, Person, LienService[]]) => {
        this.person = (claimant?.personId === person?.id) ? person : claimant?.person;
        this.services = services;
      });

    this.actionsSubj.pipe(
      takeUntil(this.ngUnsubscribe$),
      ofType(SaveUpdatedPersonComplete),
    ).subscribe((data: { updatedPerson: Person; }) => { this.person = data?.updatedPerson; });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
