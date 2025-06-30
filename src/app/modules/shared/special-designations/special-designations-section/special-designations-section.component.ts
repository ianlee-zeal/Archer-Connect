/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Person } from '@app/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'app-special-designations-section',
  templateUrl: './special-designations-section.component.html',
  styleUrls: ['./special-designations-section.component.scss'],
})
export class SpecialDesignationsSectionComponent implements OnInit, OnDestroy {
  @Input() canEdit = true;

  protected _person: Person;

  @Input() public set person(value: Person) {
    if (isEqual(value, this._person)) {
      return;
    }

    this._person = value;
    this.seedPersonInfo();
  }

  public get person(): Person {
    return this._person;
  }

  @Output() specialDesignationsChanged = new EventEmitter();

  public form: UntypedFormGroup;

  private ngUnsubscribe$ = new Subject<void>();

  constructor(
    private fb: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      deceased: [{ value: this.person.deceased, disabled: !this.canEdit }],
      minor: [{ value: this.person.minor, disabled: !this.canEdit }],
      incapacitatedAdult: [{ value: this.person.incapacitatedAdult, disabled: !this.canEdit }],
      spanishSpeakerOnly: [{ value: this.person.spanishSpeakerOnly, disabled: !this.canEdit }],
    });

    this.form.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe$),
    )
      .subscribe((value: { [key: string]: boolean }) => {
        this.specialDesignationsChanged.emit(value);
      });
  }

  protected seedPersonInfo(): void {
    if (!this.person || !this.form) {
      return;
    }

    this.form.patchValue({
      deceased: this.person.deceased,
      minor: this.person.minor,
      incapacitatedAdult: this.person.incapacitatedAdult,
      spanishSpeakerOnly: this.person.spanishSpeakerOnly,
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
