import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ContextBarElement } from '@app/entities/context-bar-element';
import { ClaimantDetailsState } from '@app/modules/claimants/claimant-details/state/reducer';
import { Store } from '@ngrx/store';
import * as selectors from '@app/modules/claimants/claimant-details/state/selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityStatus } from '@app/models/activity-status';

@Component({
  selector: 'app-context-bar',
  templateUrl: './context-bar.component.html',
  styleUrls: ['./context-bar.component.scss'],
})
export class ContextBarComponent implements OnInit, OnDestroy {
  readonly isExpanded$ = this.store.select(selectors.isExpanded);
  readonly isProjectMessagesModalOpen$ = this.store.select(selectors.isProjectMessagesModalOpen);

  @Input() title: string;
  @Input() subTitle: string;
  @Input() ratingIconClass: string;
  @Input() elements: ContextBarElement[];
  @Input() error: string;
  @Input() isEdited: boolean;
  @Input() showSpecialDesignationsBar = false;
  @Input() status: ActivityStatus;
  @Input() expandable = false;
  @Input() showAdditionalButton = false;
  @Input() additionalButtonTitle = 'Messaging';
  @Output() readonly expand = new EventEmitter<boolean>();
  @Output() readonly openModal = new EventEmitter();

  private readonly ngUnsubscribe$ = new Subject<void>();
  public isExpanded: boolean;

  constructor(
    private readonly store: Store<ClaimantDetailsState>,
  ) {}

  ngOnInit(): void {
    this.isExpanded$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(isExpanded => { this.isExpanded = isExpanded; });
  }

  onExpand(): void {
    this.isExpanded = !this.isExpanded;
    this.expand.emit(this.isExpanded);
  }

  onOpenModal(): void {
    this.openModal.emit();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
